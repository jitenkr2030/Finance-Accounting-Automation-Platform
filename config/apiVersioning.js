const express = require('express');
const semver = require('semver');

/**
 * API Versioning Middleware and Utilities
 * Implements semantic versioning for the Finance Platform API
 */

// Version configuration
const API_VERSIONS = {
  v1: {
    version: '1.0.0',
    status: 'current',
    releaseDate: '2024-01-01',
    deprecationDate: null,
    sunsetDate: null,
    features: ['basic_crud', 'authentication', 'authorization'],
    breakingChanges: []
  },
  v2: {
    version: '2.0.0',
    status: 'beta',
    releaseDate: '2024-06-01',
    deprecationDate: null,
    sunsetDate: null,
    features: ['enhanced_security', 'graphql', 'real_time', 'advanced_analytics'],
    breakingChanges: ['changed_response_format', 'removed_legacy_endpoints']
  }
};

// Default version if none specified
const DEFAULT_VERSION = process.env.DEFAULT_API_VERSION || 'v1';

/**
 * Extract API version from request
 */
const extractVersion = (req) => {
  // 1. Check URL path parameter (highest priority)
  const pathMatch = req.path.match(/^\/api\/(v\d+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // 2. Check header (Accept header)
  const acceptHeader = req.get('Accept');
  if (acceptHeader && acceptHeader.includes('application/vnd.financeplatform.v')) {
    const versionMatch = acceptHeader.match(/application\/vnd\.financeplatform\.v(\d+)/);
    if (versionMatch) {
      return `v${versionMatch[1]}`;
    }
  }
  
  // 3. Check custom header
  const versionHeader = req.get(process.env.API_VERSION_HEADER || 'API-Version');
  if (versionHeader && versionHeader.startsWith('v')) {
    return versionHeader;
  }
  
  // 4. Check query parameter (lowest priority)
  if (req.query.version && req.query.version.startsWith('v')) {
    return req.query.version;
  }
  
  return DEFAULT_VERSION;
};

/**
 * Validate API version
 */
const validateVersion = (version) => {
  if (!API_VERSIONS[version]) {
    return {
      valid: false,
      error: `Unsupported API version: ${version}`,
      supportedVersions: Object.keys(API_VERSIONS),
      defaultVersion: DEFAULT_VERSION
    };
  }
  
  const versionInfo = API_VERSIONS[version];
  
  // Check if version is deprecated
  if (versionInfo.status === 'deprecated') {
    return {
      valid: true,
      deprecated: true,
      deprecationDate: versionInfo.deprecationDate,
      sunsetDate: versionInfo.sunsetDate,
      replacement: getRecommendedVersion(version)
    };
  }
  
  // Check if version is sunset
  if (versionInfo.status === 'sunset') {
    return {
      valid: false,
      error: `API version ${version} has been sunset`,
      sunsetDate: versionInfo.sunsetDate,
      supportedVersions: Object.keys(API_VERSIONS).filter(v => API_VERSIONS[v].status !== 'sunset')
    };
  }
  
  return {
    valid: true,
    version: versionInfo
  };
};

/**
 * Get recommended version for a deprecated version
 */
const getRecommendedVersion = (deprecatedVersion) => {
  const versionOrder = Object.keys(API_VERSIONS)
    .filter(v => API_VERSIONS[v].status === 'current')
    .sort((a, b) => semver.compare(API_VERSIONS[b], API_VERSIONS[a]));
  
  return versionOrder[0] || DEFAULT_VERSION;
};

/**
 * API Versioning Middleware
 */
const apiVersioning = (req, res, next) => {
  const version = extractVersion(req);
  const validation = validateVersion(version);
  
  // Attach version info to request
  req.apiVersion = version;
  req.apiVersionInfo = validation;
  
  // Set response headers
  res.set('API-Version', version);
  res.set('X-API-Version', version);
  res.set('X-Supported-Versions', Object.keys(API_VERSIONS).join(', '));
  
  // Handle deprecated versions with warnings
  if (validation.deprecated) {
    res.set('Warning', `299 - "API version ${version} is deprecated. Please migrate to version ${validation.replacement}"`);
    
    // Add deprecation notice in response headers for clients
    if (validation.sunsetDate) {
      res.set('Sunset', validation.sunsetDate);
    }
  }
  
  // Reject sunset versions
  if (!validation.valid && !validation.deprecated) {
    return res.status(426).json({
      success: false,
      message: 'Unsupported API version',
      error: {
        code: 'UNSUPPORTED_API_VERSION',
        requestedVersion: version,
        supportedVersions: validation.supportedVersions,
        defaultVersion: DEFAULT_VERSION
      }
    });
  }
  
  next();
};

/**
 * Version-specific route handler
 */
const versionHandler = (version, handler) => {
  return (req, res, next) => {
    if (req.apiVersion === version) {
      return handler(req, res, next);
    }
    next();
  };
};

/**
 * Multiple version handler (supports multiple versions with same logic)
 */
const versionsHandler = (versions, handler) => {
  return (req, res, next) => {
    if (versions.includes(req.apiVersion)) {
      return handler(req, res, next);
    }
    next();
  };
};

/**
 * Version migration middleware
 */
const versionMigration = (req, res, next) => {
  const currentVersion = req.apiVersion;
  const migrationConfig = getMigrationConfig(currentVersion);
  
  if (migrationConfig) {
    req.migrationConfig = migrationConfig;
    
    // Apply data transformation if needed
    if (migrationConfig.transformRequest) {
      req.body = migrationConfig.transformRequest(req.body);
    }
  }
  
  next();
};

/**
 * Get migration configuration for a version
 */
const getMigrationConfig = (version) => {
  const migrations = {
    v1: {
      transformRequest: (body) => {
        // Transform v1 request format to current format
        if (body.userId) {
          body.user_id = body.userId;
          delete body.userId;
        }
        return body;
      },
      transformResponse: (data) => {
        // Transform response from current format to v1 format
        if (data.user_id) {
          data.userId = data.user_id;
          delete data.user_id;
        }
        return data;
      }
    }
  };
  
  return migrations[version] || null;
};

/**
 * Apply response transformation for specific versions
 */
const responseTransformer = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Apply version-specific response transformation
    if (req.migrationConfig && req.migrationConfig.transformResponse) {
      data = req.migrationConfig.transformResponse(data);
    }
    
    // Add version info to response
    data.api = {
      version: req.apiVersion,
      timestamp: new Date().toISOString()
    };
    
    // Add deprecation notice for deprecated versions
    if (req.apiVersionInfo && req.apiVersionInfo.deprecated) {
      data.deprecation = {
        message: `API version ${req.apiVersion} is deprecated`,
        recommendedVersion: req.apiVersionInfo.replacement,
        sunsetDate: req.apiVersionInfo.sunsetDate
      };
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Version-specific feature flags
 */
const featureFlag = (feature, versions) => {
  return (req, res, next) => {
    const versionInfo = API_VERSIONS[req.apiVersion];
    
    if (versionInfo && versionInfo.features.includes(feature)) {
      req.featureEnabled = true;
    } else {
      req.featureEnabled = false;
    }
    
    next();
  };
};

/**
 * Breaking change detection
 */
const detectBreakingChanges = (version, changes) => {
  const versionInfo = API_VERSIONS[version];
  
  if (!versionInfo) {
    return false;
  }
  
  return changes.some(change => versionInfo.breakingChanges.includes(change));
};

/**
 * Version negotiation middleware
 */
const versionNegotiation = (req, res, next) => {
  const clientVersion = extractVersion(req);
  const serverVersions = Object.keys(API_VERSIONS);
  
  // Check if client version is supported
  if (!API_VERSIONS[clientVersion]) {
    // Try to negotiate a compatible version
    const compatibleVersion = negotiateCompatibleVersion(clientVersion, serverVersions);
    
    if (compatibleVersion) {
      req.apiVersion = compatibleVersion;
      req.apiVersionInfo = validateVersion(compatibleVersion);
      
      res.set('API-Version', compatibleVersion);
      res.set('X-Negotiated-Version', 'true');
    }
  }
  
  next();
};

/**
 * Negotiate compatible version
 */
const negotiateCompatibleVersion = (requestedVersion, availableVersions) => {
  // Extract numeric version
  const requestedNum = requestedVersion.replace('v', '');
  
  // Find the highest compatible version
  const compatibleVersions = availableVersions.filter(version => {
    const versionNum = version.replace('v', '');
    return semver.gte(versionNum, requestedNum);
  });
  
  return compatibleVersions.length > 0 ? compatibleVersions[0] : DEFAULT_VERSION;
};

/**
 * Version information endpoint
 */
const versionInfoHandler = (req, res) => {
  const versions = Object.entries(API_VERSIONS).map(([version, info]) => ({
    version,
    status: info.status,
    releaseDate: info.releaseDate,
    deprecationDate: info.deprecationDate,
    sunsetDate: info.sunsetDate,
    features: info.features
  }));
  
  res.json({
    currentVersion: DEFAULT_VERSION,
    supportedVersions: versions,
    defaultVersion: DEFAULT_VERSION
  });
};

/**
 * Version status endpoint
 */
const versionStatusHandler = (req, res) => {
  const requestedVersion = req.params.version;
  const versionInfo = API_VERSIONS[requestedVersion];
  
  if (!versionInfo) {
    return res.status(404).json({
      success: false,
      message: 'Version not found',
      error: {
        code: 'VERSION_NOT_FOUND',
        requestedVersion,
        supportedVersions: Object.keys(API_VERSIONS)
      }
    });
  }
  
  const response = {
    version: requestedVersion,
    status: versionInfo.status,
    releaseDate: versionInfo.releaseDate,
    features: versionInfo.features,
    breakingChanges: versionInfo.breakingChanges
  };
  
  if (versionInfo.status === 'deprecated') {
    response.deprecationDate = versionInfo.deprecationDate;
    response.sunsetDate = versionInfo.sunsetDate;
    response.recommendedVersion = getRecommendedVersion(requestedVersion);
  }
  
  if (versionInfo.status === 'sunset') {
    response.sunsetDate = versionInfo.sunsetDate;
  }
  
  res.json(response);
};

/**
 * Rate limiting by version
 */
const versionRateLimit = (version, customLimits = {}) => {
  const defaultLimits = {
    v1: { requests: 1000, window: 15 * 60 * 1000 }, // 15 minutes
    v2: { requests: 2000, window: 15 * 60 * 1000 }   // 15 minutes
  };
  
  const limits = { ...defaultLimits[version], ...customLimits };
  
  return (req, res, next) => {
    if (req.apiVersion === version) {
      // Apply version-specific rate limiting logic here
      // This would integrate with the rate limiter configuration
      req.rateLimit = limits;
    }
    
    next();
  };
};

/**
 * Deprecation monitoring
 */
const deprecationMonitor = (req, res, next) => {
  const version = req.apiVersion;
  const versionInfo = API_VERSIONS[version];
  
  if (versionInfo && versionInfo.status === 'deprecated') {
    // Log deprecation usage for monitoring
    console.warn('Deprecated API version usage:', {
      version,
      ip: req.ip,
      userId: req.user?.id,
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  apiVersioning,
  versionHandler,
  versionsHandler,
  versionMigration,
  responseTransformer,
  featureFlag,
  detectBreakingChanges,
  versionNegotiation,
  versionInfoHandler,
  versionStatusHandler,
  versionRateLimit,
  deprecationMonitor,
  API_VERSIONS,
  DEFAULT_VERSION,
  extractVersion,
  validateVersion,
  getRecommendedVersion
};