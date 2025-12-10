const express = require('express');
const { body, validationResult } = require('express-validator');
const { Document } = require('../models/AnalyticsAI');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
  }
});

// Document upload and processing
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    const { documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = await Document.create({
      companyId: req.user.companyId,
      documentType: documentType || 'other',
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.userId,
      status: 'uploaded',
    });

    res.status(201).json({ 
      message: 'Document uploaded successfully',
      document 
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process document with OCR/AI
router.post('/:id/process', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update status to processing
    await document.update({ status: 'processing' });

    // In a real implementation, this would trigger OCR/AI processing
    // For now, we'll simulate the process
    setTimeout(async () => {
      await document.update({
        status: 'processed',
        ocrProcessed: true,
        aiProcessed: true,
        extractedData: {
          // Mock extracted data
          amount: '1000.00',
          date: '2023-12-01',
          vendor: 'ABC Company',
          confidence: 0.95,
        },
        confidence: 0.95,
      });
    }, 2000);

    res.json({ message: 'Document processing started' });
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, documentType, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { companyId: req.user.companyId };
    if (documentType) whereClause.documentType = documentType;
    if (status) whereClause.status = status;

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;