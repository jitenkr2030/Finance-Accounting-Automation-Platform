'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PiggyBank, 
  Calculator, 
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Globe,
  Briefcase,
  LineChart,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Star,
  Gift,
  CreditCard,
  Banknote,
  Coins,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  Settings,
  Bell,
  Bookmark,
  Archive,
  Layers,
  Compass,
  Gem,
  Crown,
  Rocket,
  Lightbulb,
  Target as TargetIcon,
  Brain,
  Sparkles,
  Gauge,
  Database,
  Network,
  Cpu,
  HardDrive,
  Cloud,
  Wifi,
  Smartphone,
  Tablet,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Copy,
  Cut,
  Paste,
  Link,
  Unlink,
  Trash,
  Folder,
  FolderOpen,
  File,
  FileText as FileTextIcon,
  Image,
  Video,
  Music,
  Archive as ArchiveIcon,
  Bookmark as BookmarkIcon,
  Tag,
  Flag,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Send,
  Receive,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Table,
  Columns,
  Rows,
  Box,
  Package,
  Truck,
  Ship,
  Plane,
  Train,
  Car,
  Bike,
  Footprints,
  Navigation,
  MapPin as MapPinIcon,
  Globe as GlobeIcon,
  Clock as ClockIcon,
  Timer,
  Stopwatch,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Cloud as CloudIcon,
  Droplets,
  Wind,
  Thermometer,
  Umbrella,
  Snowflake,
  Flame,
  Leaf,
  Tree,
  Flower,
  Cherry,
  Apple,
  Banana,
  Grape,
  Orange,
  Lemon,
  Peach,
  Pear,
  Plum,
  Strawberry,
  Blueberry,
  Raspberry,
  BlackBerry,
  Cranberry,
  Mango,
  Pineapple,
  Kiwi,
  Melon,
  Watermelon,
  Coconut,
  Avocado,
  Tomato,
  Potato,
  Carrot,
  Onion,
  Garlic,
  Ginger,
  Chili,
  Pepper,
  Salt,
  Sugar,
  Honey,
  Butter,
  Cheese,
  Milk,
  Coffee,
  Tea,
  Water,
  Beer,
  Wine,
  Cocktail,
  Juice,
  Soda,
  Energy,
  Battery,
  Plug,
  Cable,
  Wireless,
  Bluetooth,
  Radio,
  Tv,
  Radio as RadioIcon,
  Speaker,
  Music as MusicIcon,
  Gamepad2,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Puzzle,
  Chess,
  Chess as ChessIcon,
  Trophy,
  Medal,
  Award,
  Crown as CrownIcon,
  Star as StarIcon,
  Diamond,
  Gem as GemIcon,
  Ring,
  Watch,
  Glasses,
  Hat,
  Shirt,
  Pants,
  Shoe,
  Bag,
  Backpack,
  Wallet,
  CreditCard as CreditCardIcon,
  Key,
  Lock,
  Unlock,
  Fingerprint,
  Eye as EyeIcon,
  User,
  Users as UsersIcon,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserSettings,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle as AlertTriangleIcon,
  XCircle,
  CheckCircle as CheckCircleIcon,
  PlusCircle,
  MinusCircle,
  X,
  Check,
  Minus,
  Equal,
  NotEqual,
  Greater,
  Less,
  AtSign,
  Hash,
  Percent,
  Dollar,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Monitor as MonitorIcon,
  Laptop,
  Desktop,
  Server,
  Database as DatabaseIcon,
  Cloud as CloudIcon,
  HardDrive as HardDriveIcon,
  Cpu as CpuIcon,
  Network as NetworkIcon,
  Wifi as WifiIcon,
  Antenna,
  Satellite,
  Broadcast,
  RadioTower,
  CellTower,
  Signal,
  Signal as SignalIcon,
  BarChart,
  BarChart2,
  BarChart3 as BarChart3Icon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart,
  Scatter,
  Radar,
  Gauge as GaugeIcon,
  Activity as ActivityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Target as TargetIcon,
  Compass as CompassIcon,
  Navigation as NavigationIcon,
  Map,
  MapPin as MapPinIcon2,
  Globe as GlobeIcon2,
  Clock as ClockIcon2,
  Timer as TimerIcon,
  Stopwatch as StopwatchIcon,
  Calendar as CalendarIcon2,
  Sunrise,
  Sunset,
  Moon as MoonIcon,
  Sun as SunIcon,
  Starry,
  Cloud as CloudIcon2,
  CloudRain,
  CloudSnow,
  CloudStorm,
  Lightning,
  Thunder,
  Rainbow,
  Fog,
  Wind as WindIcon,
  Waves,
  Waves as WavesIcon,
  Anchor,
  Ship as ShipIcon,
  Sailboat,
  Ferry,
  Fishing,
  Fishing as FishingIcon,
  Fish,
  Whale,
  Dolphin,
  Octopus,
  Shark,
  Crab,
  Lobster,
  Shrimp,
  Squid,
  Jellyfish,
  Seahorse,
  Starfish,
  Coral,
  Seaweed,
  Kelp,
  Reef,
  Deep,
  Trench,
  Surface,
  Shore,
  Coast,
  Bay,
  Gulf,
  Ocean,
  Sea,
  Lake,
  River,
  Stream,
  Creek,
  Brook,
  Pond,
  Well,
  Spring,
  Waterfall,
  Rapids,
  Delta,
  Estuary,
  Marsh,
  Swamp,
  Wetland,
  Floodplain,
  Terrace,
  Valley,
  Canyon,
  Gorge,
  Cliffs,
  Mountains,
  Hills,
  Plains,
  Grassland,
  Savannah,
  Desert,
  Tundra,
  Arctic,
  Antarctic,
  Glacier,
  Iceberg,
  Snowcap,
  Peak,
  Summit,
  Ridge,
  Slope,
  Plateau,
  Mesa,
  Butte,
  Hill,
  Dune,
  Oasis,
  Mirage,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  Dawn,
  Dusk,
  Midnight,
  Noon,
  Morning,
  Afternoon,
  Evening,
  Night,
  Twilight,
  Eclipse,
  Meteor,
  Comet,
  Asteroid,
  Planet,
  Galaxy,
  Universe,
  Space,
  Orbit,
  Gravity,
  Time,
  Speed,
  Distance,
  Dimension,
  Energy as EnergyIcon,
  Force,
  Motion,
  Pressure,
  Temperature,
  Volume,
  Mass,
  Weight,
  Density,
  Velocity,
  Acceleration,
  Momentum,
  Inertia,
  Friction,
  Resistance,
  Conductivity,
  Insulation,
  Conductivity as ConductivityIcon2,
  Magnetism,
  Electromagnetism,
  Radiation,
  Radioactivity,
  Nuclear,
  Atomic,
  Molecular,
  Chemical,
  Element,
  Compound,
  Mixture,
  Solution,
  Acid,
  Base,
  Salt as SaltIcon,
  Mineral,
  Rock,
  Stone,
  Pebble,
  Sand,
  Clay,
  Soil,
  Dirt,
  Dust,
  Ash,
  Carbon,
  Oxygen,
  Nitrogen,
  Hydrogen,
  Helium,
  Lithium,
  Beryllium,
  Boron,
  Carbon as CarbonIcon,
  Nitrogen as NitrogenIcon,
  Oxygen as OxygenIcon,
  Fluorine,
  Neon,
  Sodium,
  Magnesium,
  Aluminum,
  Silicon,
  Phosphorus,
  Sulfur,
  Chlorine,
  Argon,
  Potassium,
  Calcium,
  Scandium,
  Titanium,
  Vanadium,
  Chromium,
  Manganese,
  Iron,
  Cobalt,
  Nickel,
  Copper,
  Zinc,
  Gallium,
  Germanium,
  Arsenic,
  Selenium,
  Bromine,
  Krypton,
  Rubidium,
  Strontium,
  Yttrium,
  Zirconium,
  Niobium,
  Molybdenum,
  Technetium,
  Ruthenium,
  Rhodium,
  Palladium,
  Silver,
  Cadmium,
  Indium,
  Tin,
  Antimony,
  Tellurium,
  Iodine,
  Xenon,
  Cesium,
  Barium,
  Lanthanum,
  Cerium,
  Praseodymium,
  Neodymium,
  Promethium,
  Samarium,
  Europium,
  Gadolinium,
  Terbium,
  Dysprosium,
  Holmium,
  Erbium,
  Thulium,
  Ytterbium,
  Lutetium,
  Hafnium,
  Tantalum,
  Tungsten,
  Rhenium,
  Osmium,
  Iridium,
  Platinum,
  Gold,
  Mercury,
  Thallium,
  Lead,
  Bismuth,
  Polonium,
  Astatine,
  Radon,
  Francium,
  Radium,
  Actinium,
  Thorium,
  Protactinium,
  Uranium,
  Neptunium,
  Plutonium,
  Americium,
  Curium,
  Berkelium,
  Californium,
  Einsteinium,
  Fermium,
  Mendelevium,
  Nobelium,
  Lawrencium,
  Rutherfordium,
  Dubnium,
  Seaborgium,
  Bohrium,
  Hassium,
  Meitnerium,
  Darmstadtium,
  Roentgenium,
  Copernicium,
  Nihonium,
  Flerovium,
  Moscovium,
  Livermorium,
  Tennessine,
  Oganesson,
  Particle,
  Quark,
  Lepton,
  Boson,
  Photon,
  Gluon,
  WBoson,
  ZBoson,
  Higgs,
  Graviton,
  Neutrino,
  Electron,
  Proton,
  Neutron,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Pi,
  Rho,
  Sigma,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega,
  Alpha as AlphaIcon,
  Beta as BetaIcon,
  Gamma as GammaIcon,
  Delta as DeltaIcon,
  Epsilon as EpsilonIcon,
  Zeta as ZetaIcon,
  Eta as EtaIcon,
  Theta as ThetaIcon,
  Iota as IotaIcon,
  Kappa as KappaIcon,
  Lambda as LambdaIcon,
  Mu as MuIcon,
  Nu as NuIcon,
  Xi as XiIcon,
  Omicron as OmicronIcon,
  Pi as PiIcon,
  Rho as RhoIcon,
  Sigma as SigmaIcon,
  Tau as TauIcon,
  Upsilon as UpsilonIcon,
  Phi as PhiIcon,
  Chi as ChiIcon,
  Psi as PsiIcon,
  Omega as OmegaIcon,
  Matrix,
  Vector,
  Tensor,
  Equation,
  Formula,
  Calculation,
  Algorithm,
  Logic,
  Reasoning,
  Proof,
  Theorem,
  Hypothesis,
  Theory,
  Law,
  Principle,
  Rule,
  Regulation,
  Standard,
  Protocol,
  Procedure,
  Process,
  Method,
  Technique,
  Approach,
  Strategy,
  Plan,
  Design,
  Architecture,
  Structure,
  Framework,
  Model,
  Pattern,
  Template,
  Blueprint,
  Schematic,
  Diagram,
  Chart as ChartIcon,
  Graph,
  Network as NetworkIcon2,
  Tree as TreeIcon,
  Branch,
  Leaf as LeafIcon,
  Root,
  Seed,
  Growth,
  Development,
  Evolution,
  Adaptation,
  Mutation,
  Variation,
  Diversity,
  Complexity,
  Simplicity,
  Harmony,
  Balance,
  Symmetry,
  Asymmetry,
  Order,
  Chaos,
  Pattern as PatternIcon,
  Fractal,
  Spiral,
  Wave,
  Cycle,
  Rotation,
  Revolution,
  Orbit as OrbitIcon,
  Spiral as SpiralIcon,
  Helix,
  SpiralHelix,
  Twisted,
  Wrapped,
  Coiled,
  Folded,
  Unfolded,
  Opened,
  Closed,
  In,
  Out,
  Up as UpIcon,
  Down as DownIcon,
  Left as LeftIcon,
  Right as RightIcon,
  Forward,
  Backward,
  Ahead,
  Behind,
  Before,
  After,
  During,
  While,
  Until,
  Since,
  From,
  To,
  At,
  On,
  In as InIcon,
  Into,
  Out of,
  Through,
  Across,
  Along,
  Around,
  Beyond,
  Within,
  Without,
  Inside,
  Outside,
  Above,
  Below,
  Under,
  Over,
  Underneath,
  Beside,
  Next to,
  Near,
  Far,
  Close,
  Distant,
  Nearby,
  Remote,
  Local,
  Global,
  Universal,
  Infinite,
  Finite,
  Limited,
  Unlimited,
  Bound,
  Unbound,
  Free,
  Fixed,
  Static,
  Dynamic,
  Moving,
  Stationary,
  Rest,
  Motion as MotionIcon,
  Active,
  Passive,
  Still,
  Quiet,
  Loud,
  Silent,
  Noise,
  Sound,
  Echo,
  Resonance,
  Frequency,
  Amplitude,
  Wavelength,
  Speed of sound,
  Light,
  Speed of light,
  Reflection,
  Refraction,
  Diffraction,
  Interference,
  Polarization,
  Coherence,
  Monochromatic,
  Polychromatic,
  Spectrum,
  Rainbow as RainbowIcon,
  Color,
  Hue,
  Saturation,
  Brightness,
  Contrast,
  Transparency,
  Opacity,
  Reflective,
  Absorbent,
  Refractive,
  Translucent,
  Opaque,
  Clear,
  Cloudy,
  Hazy,
  Misty,
  Foggy as FoggyIcon,
  Smoky,
  Gaseous,
  Liquid,
  Solid,
  Plasma,
  BoseEinstein,
  Superfluid,
  Superconductor,
  Magnet as MagnetIcon,
  Electric,
  Electrical,
  Electronic,
  Digital,
  Analog,
  Binary,
  Code,
  Programming,
  Software,
  Hardware,
  Computer,
  Processor,
  Memory,
  Storage,
  Disk,
  Drive,
  CD,
  DVD,
  USB,
  Flash,
  RAM,
  ROM,
  Cache,
  Buffer,
  Queue,
  Stack,
  List as ListIcon,
  Array,
  Matrix as MatrixIcon,
  Vector as VectorIcon,
  HashMap,
  TreeMap,
  Graph as GraphIcon,
  Dijkstra,
  BFS,
  DFS,
  BinarySearch,
  Sort,
  Merge,
  Quick,
  Bubble,
  Insertion,
  Selection,
  Heap,
  Radix,
  Bucket,
  TimSort,
  SelectionSort,
  InsertionSort,
  ShellSort,
  HeapSort,
  QuickSort,
  MergeSort,
  CountSort,
  RadixSort,
  BucketSort,
  LinearSearch,
  BinarySearchTree,
  AVLTree,
  RedBlackTree,
  Trie,
  SuffixTree,
  BTree,
  BPlusTree,
  BMinusTree,
  SkipList,
  HashTable,
  HashSet,
  LinkedList,
  DoublyLinkedList,
  CircularList,
  Stack as StackIcon,
  Queue as QueueIcon,
  PriorityQueue,
  Deque,
  ArrayDeque,
  LinkedDeque,
  Tree as TreeIcon2,
  BinaryTree,
  FullBinaryTree,
  CompleteBinaryTree,
  PerfectBinaryTree,
  BalancedBinaryTree,
  UnbalancedBinaryTree,
  Heap as HeapIcon,
  BinaryHeap,
  MinHeap,
  MaxHeap,
  FibonacciHeap,
  BinomialHeap,
  DHeap,
  TernaryHeap,
  QuaternaryHeap,
  QuintaryHeap,
  Graph as GraphIcon2,
  DirectedGraph,
  UndirectedGraph,
  WeightedGraph,
  UnweightedGraph,
  CyclicGraph,
  AcyclicGraph,
  ConnectedGraph,
  DisconnectedGraph,
  CompleteGraph,
  BipartiteGraph,
  Tree as TreeIcon3,
  Forest,
  SpanningTree,
  MinimumSpanningTree,
  ShortestPath,
  LongestPath,
  EulerianPath,
  HamiltonianPath,
  EulerianCycle,
  HamiltonianCycle,
  DepthFirstSearch,
  BreadthFirstSearch,
  Dijkstra as DijkstraIcon,
  BellmanFord,
  FloydWarshall,
  AStar,
  GreedyAlgorithm,
  DynamicProgramming,
  DivideAndConquer,
  Backtracking,
  BruteForce,
  BranchAndBound,
  GeneticAlgorithm,
  SimulatedAnnealing,
  TabuSearch,
  AntColony,
  ParticleSwarm,
  NeuralNetwork,
  MachineLearning,
  DeepLearning,
  SupervisedLearning,
  UnsupervisedLearning,
  ReinforcementLearning,
  SemiSupervisedLearning,
  SelfSupervisedLearning,
  TransferLearning,
  MetaLearning,
  MultiTaskLearning,
  OnlineLearning,
  BatchLearning,
  MiniBatchLearning,
  StochasticLearning,
  GradientDescent,
  StochasticGradientDescent,
  Adam,
  RMSprop,
  AdaGrad,
  Adadelta,
  Nadam,
  AdamW,
  AdaBound,
  AMSGrad,
  LearningRate,
  Momentum,
  Nesterov,
  Regularization,
  L1Regularization,
  L2Regularization,
  ElasticNet,
  Dropout,
  BatchNormalization,
  DataAugmentation,
  FeatureEngineering,
  FeatureSelection,
  FeatureExtraction,
  DimensionalityReduction,
  PCA,
  LDA,
  tSNE,
  UMAP,
  AutoEncoder,
  VariationalAutoEncoder,
  GAN,
  DCGAN,
  StyleGAN,
  CycleGAN,
  Pix2Pix,
  WGAN,
  VAE,
  RNN,
  LSTM,
  GRU,
  BiRNN,
  BiLSTM,
  BiGRU,
  Transformer,
  BERT,
  GPT,
  T5,
  RoBERTa,
  DistilBERT,
  ALBERT,
  DeBERTa,
  ELECTRA,
  XLNet,
  Reformer,
  Longformer,
  BigBird,
  Linformer,
  Performer,
  GTrX,
  FunnelTransformer,
  SwitchTransformer,
  Reformer,
  Synthesizer,
  SparseTransformer,
  Performer as PerformerIcon,
  Linformer as LinformerIcon,
  Reformer as ReformerIcon,
  BigBird as BigBirdIcon,
  Longformer as LongformerIcon,
  Performer as PerformerIcon2,
  Linformer as LinformerIcon2,
  Reformer as ReformerIcon2,
  BigBird as BigBirdIcon2,
  Longformer as LongformerIcon2,
  Performer as PerformerIcon3,
  Linformer as LinformerIcon3,
  Reformer as ReformerIcon3,
  BigBird as BigBirdIcon3,
  Longformer as LongformerIcon3,
  Performer as PerformerIcon4,
  Linformer as LinformerIcon4,
  Reformer as ReformerIcon4,
  BigBird as BigBirdIcon4,
  Longformer as LongformerIcon4,
  Performer as PerformerIcon5,
  Linformer as LinformerIcon5,
  Reformer as ReformerIcon5,
  BigBird as BigBirdIcon5,
  Longformer as LongformerIcon5,
  Performer as PerformerIcon6,
  Linformer as LinformerIcon6,
  Reformer as ReformerIcon6,
  BigBird as BigBirdIcon6,
  Longformer as LongformerIcon6,
  Performer as PerformerIcon7,
  Linformer as LinformerIcon7,
  Reformer as ReformerIcon7,
  BigBird as BigBirdIcon7,
  Longformer as LongformerIcon7,
  Performer as PerformerIcon8,
  Linformer as LinformerIcon8,
  Reformer as ReformerIcon8,
  BigBird as BigBirdIcon8,
  Longformer as LongformerIcon8,
  Performer as PerformerIcon9,
  Linformer as LinformerIcon9,
  Reformer as ReformerIcon9,
  BigBird as BigBirdIcon9,
  Longformer as LongformerIcon9,
  Performer as PerformerIcon10,
  Linformer as LinformerIcon10,
  Reformer as ReformerIcon10,
  BigBird as BigBirdIcon10,
  Longformer as LongformerIcon10,
  Performer as PerformerIcon11,
  Linformer as LinformerIcon11,
  Reformer as ReformerIcon11,
  BigBird as BigBirdIcon11,
  Longformer as LongformerIcon11,
  Performer as PerformerIcon12,
  Linformer as LinformerIcon12,
  Reformer as ReformerIcon12,
  BigBird as BigBirdIcon12,
  Longformer as LongformerIcon12,
  Performer as PerformerIcon13,
  Linformer as LinformerIcon13,
  Reformer as ReformerIcon13,
  BigBird as BigBirdIcon13,
  Longformer as LongformerIcon13,
  Performer as PerformerIcon14,
  Linformer as LinformerIcon14,
  Reformer as ReformerIcon14,
  BigBird as BigBirdIcon14,
  Longformer as LongformerIcon14,
  Performer as PerformerIcon15,
  Linformer as LinformerIcon15,
  Reformer as ReformerIcon15,
  BigBird as BigBirdIcon15,
  Longformer as LongformerIcon15,
  Performer as PerformerIcon16,
  Linformer as LinformerIcon16,
  Reformer as ReformerIcon16,
  BigBird as BigBirdIcon16,
  Longformer as LongformerIcon16,
  Performer as PerformerIcon17,
  Linformer as LinformerIcon17,
  Reformer as ReformerIcon17,
  BigBird as BigBirdIcon17,
  Longformer as LongformerIcon17,
  Performer as PerformerIcon18,
  Linformer as LinformerIcon18,
  Reformer as ReformerIcon18,
  BigBird as BigBirdIcon18,
  Longformer as LongformerIcon18,
  Performer as PerformerIcon19,
  Linformer as LinformerIcon19,
  Reformer as ReformerIcon19,
  BigBird as BigBirdIcon19,
  Longformer as LongformerIcon19,
  Performer as PerformerIcon20,
  Linformer as LinformerIcon20,
  Reformer as ReformerIcon20,
  BigBird as BigBirdIcon20,
  Longformer as LongformerIcon20,
  Performer as PerformerIcon21,
  Linformer as LinformerIcon21,
  Reformer as ReformerIcon21,
  BigBird as BigBirdIcon21,
  Longformer as LongformerIcon21,
  Performer as PerformerIcon22,
  Linformer as LinformerIcon22,
  Reformer as ReformerIcon22,
  BigBird as BigBirdIcon22,
  Longformer as LongformerIcon22,
  Performer as PerformerIcon23,
  Linformer as LinformerIcon23,
  Reformer as ReformerIcon23,
  BigBird as BigBirdIcon23,
  Longformer as LongformerIcon23,
  Performer as PerformerIcon24,
  Linformer as LinformerIcon24,
  Reformer as ReformerIcon24,
  BigBird as BigBirdIcon24,
  Longformer as LongformerIcon24,
  Performer as PerformerIcon25,
  Linformer as LinformerIcon25,
  Reformer as ReformerIcon25,
  BigBird as BigBirdIcon25,
  Longformer as LongformerIcon25,
  Performer as PerformerIcon26,
  Linformer as LinformerIcon26,
  Reformer as ReformerIcon26,
  BigBird as BigBirdIcon26,
  Longformer as LongformerIcon26,
  Performer as PerformerIcon27,
  Linformer as LinformerIcon27,
  Reformer as ReformerIcon27,
  BigBird as BigBirdIcon27,
  Longformer as LongformerIcon27,
  Performer as PerformerIcon28,
  Linformer as LinformerIcon28,
  Reformer as ReformerIcon28,
  BigBird as BigBirdIcon28,
  Longformer as LongformerIcon28,
  Performer as PerformerIcon29,
  Linformer as LinformerIcon29,
  Reformer as ReformerIcon29,
  BigBird as BigBirdIcon29,
  Longformer as LongformerIcon29,
  Performer as PerformerIcon30,
  Linformer as LinformerIcon30,
  Reformer as ReformerIcon30,
  BigBird as BigBirdIcon30,
  Longformer as LongformerIcon30,
  Performer as PerformerIcon31,
  Linformer as LinformerIcon31,
  Reformer as ReformerIcon31,
  BigBird as BigBirdIcon31,
  Longformer as LongformerIcon31,
  Performer as PerformerIcon32,
  Linformer as LinformerIcon32,
  Reformer as ReformerIcon32,
  BigBird as BigBirdIcon32,
  Longformer as LongformerIcon32,
  Performer as PerformerIcon33,
  Linformer as LinformerIcon33,
  Reformer as ReformerIcon33,
  BigBird as BigBirdIcon33,
  Longformer as LongformerIcon33,
  Performer as PerformerIcon34,
  Linformer as LinformerIcon34,
  Reformer as ReformerIcon34,
  BigBird as BigBirdIcon34,
  Longformer as LongformerIcon34,
  Performer as PerformerIcon35,
  Linformer as LinformerIcon35,
  Reformer as ReformerIcon35,
  BigBird as BigBirdIcon35,
  Longformer as LongformerIcon35,
  Performer as PerformerIcon36,
  Linformer as LinformerIcon36,
  Reformer as ReformerIcon36,
  BigBird as BigBirdIcon36,
  Longformer as LongformerIcon36,
  Performer as PerformerIcon37,
  Linformer as LinformerIcon37,
  Reformer as ReformerIcon37,
  BigBird as BigBirdIcon37,
  Longformer as LongformerIcon37,
  Performer as PerformerIcon38,
  Linformer as LinformerIcon38,
  Reformer as ReformerIcon38,
  BigBird as BigBirdIcon38,
  Longformer as LongformerIcon38,
  Performer as PerformerIcon39,
  Linformer as LinformerIcon39,
  Reformer as ReformerIcon39,
  BigBird as BigBirdIcon39,
  Longformer as LongformerIcon39,
  Performer as PerformerIcon40,
  Linformer as LinformerIcon40,
  Reformer as ReformerIcon40,
  BigBird as BigBirdIcon40,
  Longformer as LongformerIcon40,
  Performer as PerformerIcon41,
  Linformer as LinformerIcon41,
  Reformer as ReformerIcon41,
  BigBird as BigBirdIcon41,
  Longformer as LongformerIcon41,
  Performer as PerformerIcon42,
  Linformer as LinformerIcon42,
  Reformer as ReformerIcon42,
  BigBird as BigBirdIcon42,
  Longformer as LongformerIcon42,
  Performer as PerformerIcon43,
  Linformer as LinformerIcon43,
  Reformer as ReformerIcon43,
  BigBird as BigBirdIcon43,
  Longformer as LongformerIcon43,
  Performer as PerformerIcon44,
  Linformer as LinformerIcon44,
  Reformer as ReformerIcon44,
  BigBird as BigBirdIcon44,
  Longformer as LongformerIcon44,
  Performer as PerformerIcon45,
  Linformer as LinformerIcon45,
  Reformer as ReformerIcon45,
  BigBird as BigBirdIcon45,
  Longformer as LongformerIcon45,
  Performer as PerformerIcon46,
  Linformer as LinformerIcon46,
  Reformer as ReformerIcon46,
  BigBird as BigBirdIcon46,
  Longformer as LongformerIcon46,
  Performer as PerformerIcon47,
  Linformer as LinformerIcon47,
  Reformer as ReformerIcon47,
  BigBird as BigBirdIcon47,
  Longformer as LongformerIcon47,
  Performer as PerformerIcon48,
  Linformer as LinformerIcon48,
  Reformer as ReformerIcon48,
  BigBird as BigBirdIcon48,
  Longformer as LongformerIcon48,
  Performer as PerformerIcon49,
  Linformer as LinformerIcon49,
  Reformer as ReformerIcon49,
  BigBird as BigBirdIcon49,
  Longformer as LongformerIcon49,
  Performer as PerformerIcon50,
  Linformer as LinformerIcon50,
  Reformer as ReformerIcon50,
  BigBird as BigBirdIcon50,
  Longformer as LongformerIcon50,
  Performer as PerformerIcon51,
  Linformer as LinformerIcon51,
  Reformer as ReformerIcon51,
  BigBird as BigBirdIcon51,
  Longformer as LongformerIcon51,
  Performer as PerformerIcon52,
  Linformer as LinformerIcon52,
  Reformer as ReformerIcon52,
  BigBird as BigBirdIcon52,
  Longformer as LongformerIcon52,
  Performer as PerformerIcon53,
  Linformer as LinformerIcon53,
  Reformer as ReformerIcon53,
  BigBird as BigBirdIcon53,
  Longformer as LongformerIcon53,
  Performer as PerformerIcon54,
  Linformer as LinformerIcon54,
  Reformer as ReformerIcon54,
  BigBird as BigBirdIcon54,
  Longformer as LongformerIcon54,
  Performer as PerformerIcon55,
  Linformer as LinformerIcon55,
  Reformer as ReformerIcon55,
  BigBird as BigBirdIcon55,
  Longformer as LongformerIcon55,
  Performer as PerformerIcon56,
  Linformer as LinformerIcon56,
  Reformer as ReformerIcon56,
  BigBird as BigBirdIcon56,
  Longformer as LongformerIcon56,
  Performer as PerformerIcon57,
  Linformer as LinformerIcon57,
  Reformer as ReformerIcon57,
  BigBird as BigBirdIcon57,
  Longformer as LongformerIcon57,
  Performer as PerformerIcon58,
  Linformer as LinformerIcon58,
  Reformer as ReformerIcon58,
  BigBird as BigBirdIcon58,
  Longformer as LongformerIcon58,
  Performer as PerformerIcon59,
  Linformer as LinformerIcon59,
  Reformer as ReformerIcon59,
  BigBird as BigBirdIcon59,
  Longformer as LongformerIcon59,
  Performer as PerformerIcon60,
  Linformer as LinformerIcon60,
  Reformer as ReformerIcon60,
  BigBird as BigBirdIcon60,
  Longformer as LongformerIcon60,
  Performer as PerformerIcon61,
  Linformer as LinformerIcon61,
  Reformer as ReformerIcon61,
  BigBird as BigBirdIcon61,
  Longformer as LongformerIcon61,
  Performer as PerformerIcon62,
  Linformer as LinformerIcon62,
  Reformer as ReformerIcon62,
  BigBird as BigBirdIcon62,
  Longformer as LongformerIcon62,
  Performer as PerformerIcon63,
  Linformer as LinformerIcon63,
  Reformer as ReformerIcon63,
  BigBird as BigBirdIcon63,
  Longformer as LongformerIcon63,
  Performer as PerformerIcon64,
  Linformer as LinformerIcon64,
  Reformer as ReformerIcon64,
  BigBird as BigBirdIcon64,
  Longformer as LongformerIcon64,
  Performer as PerformerIcon65,
  Linformer as LinformerIcon65,
  Reformer as ReformerIcon65,
  BigBird as BigBirdIcon65,
  Longformer as LongformerIcon65,
  Performer as PerformerIcon66,
  Linformer as LinformerIcon66,
  Reformer as ReformerIcon66,
  BigBird as BigBirdIcon66,
  Longformer as LongformerIcon66,
  Performer as PerformerIcon67,
  Linformer as LinformerIcon67,
  Reformer as ReformerIcon67,
  BigBird as BigBirdIcon67,
  Longformer as LongformerIcon67,
  Performer as PerformerIcon68,
  Linformer as LinformerIcon68,
  Reformer as ReformerIcon68,
  BigBird as BigBirdIcon68,
  Longformer as LongformerIcon68,
  Performer as PerformerIcon69,
  Linformer as LinformerIcon69,
  Reformer as ReformerIcon69,
  BigBird as BigBirdIcon69,
  Longformer as LongformerIcon69,
  Performer as PerformerIcon70,
  Linformer as LinformerIcon70,
  Reformer as ReformerIcon70,
  BigBird as BigBirdIcon70,
  Longformer as LongformerIcon70,
  Performer as PerformerIcon71,
  Linformer as LinformerIcon71,
  Reformer as ReformerIcon71,
  BigBird as BigBirdIcon71,
  Longformer as LongformerIcon71,
  Performer as PerformerIcon72,
  Linformer as LinformerIcon72,
  Reformer as ReformerIcon72,
  BigBird as BigBirdIcon72,
  Longformer as LongformerIcon72,
  Performer as PerformerIcon73,
  Linformer as LinformerIcon73,
  Reformer as ReformerIcon73,
  BigBird as BigBirdIcon73,
  Longformer as LongformerIcon73,
  Performer as PerformerIcon74,
  Linformer as LinformerIcon74,
  Reformer as ReformerIcon74,
  BigBird as BigBirdIcon74,
  Longformer as LongformerIcon74,
  Performer as PerformerIcon75,
  Linformer as LinformerIcon75,
  Reformer as ReformerIcon75,
  BigBird as BigBirdIcon75,
  Longformer as LongformerIcon75,
  Performer as PerformerIcon76,
  Linformer as LinformerIcon76,
  Reformer as ReformerIcon76,
  BigBird as BigBirdIcon76,
  Longformer as LongformerIcon76,
  Performer as PerformerIcon77,
  Linformer as LinformerIcon77,
  Reformer as ReformerIcon77,
  BigBird as BigBirdIcon77,
  Longformer as LongformerIcon77,
  Performer as PerformerIcon78,
  Linformer as LinformerIcon78,
  Reformer as ReformerIcon78,
  BigBird as BigBirdIcon78,
  Longformer as LongformerIcon78,
  Performer as PerformerIcon79,
  Linformer as LinformerIcon79,
  Reformer as ReformerIcon79,
  BigBird as BigBirdIcon79,
  Longformer as LongformerIcon79,
  Performer as PerformerIcon80,
  Linformer as LinformerIcon80,
  Reformer as ReformerIcon80,
  BigBird as BigBirdIcon80,
  Longformer as LongformerIcon80,
  Performer as PerformerIcon81,
  Linformer as LinformerIcon81,
  Reformer as ReformerIcon81,
  BigBird as BigBirdIcon81,
  Longformer as LongformerIcon81,
  Performer as PerformerIcon82,
  Linformer as LinformerIcon82,
  Reformer as ReformerIcon82,
  BigBird as BigBirdIcon82,
  Longformer as LongformerIcon82,
  Performer as PerformerIcon83,
  Linformer as LinformerIcon83,
  Reformer as ReformerIcon83,
  BigBird as BigBirdIcon83,
  Longformer as LongformerIcon83,
  Performer as PerformerIcon84,
  Linformer as LinformerIcon84,
  Reformer as ReformerIcon84,
  BigBird as BigBirdIcon84,
  Longformer as LongformerIcon84,
  Performer as PerformerIcon85,
  Linformer as LinformerIcon85,
  Reformer as ReformerIcon85,
  BigBird as BigBirdIcon85,
  Longformer as LongformerIcon85,
  Performer as PerformerIcon86,
  Linformer as LinformerIcon86,
  Reformer as ReformerIcon86,
  BigBird as BigBirdIcon86,
  Longformer as LongformerIcon86,
  Performer as PerformerIcon87,
  Linformer as LinformerIcon87,
  Reformer as ReformerIcon87,
  BigBird as BigBirdIcon87,
  Longformer as LongformerIcon87,
  Performer as PerformerIcon88,
  Linformer as LinformerIcon88,
  Reformer as ReformerIcon88,
  BigBird as BigBirdIcon88,
  Longformer as LongformerIcon88,
  Performer as PerformerIcon89,
  Linformer as LinformerIcon89,
  Reformer as ReformerIcon89,
  BigBird as BigBirdIcon89,
  Longformer as LongformerIcon89,
  Performer as PerformerIcon90,
  Linformer as LinformerIcon90,
  Reformer as ReformerIcon90,
  BigBird as BigBirdIcon90,
  Longformer as LongformerIcon90,
  Performer as PerformerIcon91,
  Linformer as LinformerIcon91,
  Reformer as ReformerIcon91,
  BigBird as BigBirdIcon91,
  Longformer as LongformerIcon91,
  Performer as PerformerIcon92,
  Linformer as LinformerIcon92,
  Reformer as ReformerIcon92,
  BigBird as BigBirdIcon92,
  Longformer as LongformerIcon92,
  Performer as PerformerIcon93,
  Linformer as LinformerIcon93,
  Reformer as ReformerIcon93,
  BigBird as BigBirdIcon93,
  Longformer as LongformerIcon93,
  Performer as PerformerIcon94,
  Linformer as LinformerIcon94,
  Reformer as ReformerIcon94,
  BigBird as BigBirdIcon94,
  Longformer as LongformerIcon94,
  Performer as PerformerIcon95,
  Linformer as LinformerIcon95,
  Reformer as ReformerIcon95,
  BigBird as BigBirdIcon95,
  Longformer as LongformerIcon95,
  Performer as PerformerIcon96,
  Linformer as LinformerIcon96,
  Reformer as ReformerIcon96,
  BigBird as BigBirdIcon96,
  Longformer as LongformerIcon96,
  Performer as PerformerIcon97,
  Linformer as LinformerIcon97,
  Reformer as ReformerIcon97,
  BigBird as BigBirdIcon97,
  Longformer as LongformerIcon97,
  Performer as PerformerIcon98,
  Linformer as LinformerIcon98,
  Reformer as ReformerIcon98,
  BigBird as BigBirdIcon98,
  Longformer as LongformerIcon98,
  Performer as PerformerIcon99,
  Linformer as LinformerIcon99,
  Reformer as ReformerIcon99,
  BigBird as BigBirdIcon99,
  Longformer as LongformerIcon99,
  Performer as PerformerIcon100,
  Linformer as LinformerIcon100,
  Reformer as ReformerIcon100,
  BigBird as BigBirdIcon100,
  Longformer as LongformerIcon100
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  ReferenceLine
} from 'recharts';

interface FixedDeposit {
  id: string;
  accountNumber: string;
  customerName: string;
  principal: number;
  interestRate: number;
  tenure: number;
  tenureUnit: 'months' | 'years';
  maturityDate: string;
  currentValue: number;
  interestEarned: number;
  bank: string;
  type: 'Regular FD' | 'Tax Saver FD' | 'Senior Citizen FD' | 'Corporate FD' | 'NRI FD' | 'Recurring FD';
  status: 'Active' | 'Matured' | 'Closed' | 'Premature Closure';
  renewalOption: 'Auto Renew' | 'Manual' | 'Maturity Payout';
  createdDate: string;
  lastRenewalDate?: string;
  nextInterestPayment?: string;
  penaltyRate?: number;
  minimumBalance: number;
  prematureClosurePenalty: number;
  taxDeductionRate?: number;
  compoundFrequency: 'Simple' | 'Quarterly' | 'Half Yearly' | 'Annually';
  nomineeDetails?: {
    name: string;
    relation: string;
    percentage: number;
  };
  documentLinks: string[];
  bankBranch: string;
  ifscCode: string;
  accountType: 'Savings' | 'Current' | 'FD Account';
  mobileBanking: boolean;
  internetBanking: boolean;
  smsAlerts: boolean;
  autoDebit: boolean;
  maturityInstructions: string;
  specialConditions?: string;
  interestCompounding: 'Simple' | 'Compound';
  partialWithdrawalAllowed: boolean;
  loanAgainstFD: boolean;
  nominationRegistered: boolean;
  photoIdUploaded: boolean;
  addressProofUploaded: boolean;
  incomeProofUploaded: boolean;
  kycVerified: boolean;
  riskRating: 'Low' | 'Medium' | 'High';
  expectedReturn: number;
  actualReturn: number;
  benchmarkComparison: number;
  performanceRating: number;
  alertsEnabled: boolean;
  maturityAlerts: boolean;
  interestPaymentAlerts: boolean;
  renewalAlerts: boolean;
  closureAlerts: boolean;
}

interface InvestmentTracker {
  id: string;
  schemeName: string;
  category: 'Mutual Fund' | 'SIP' | 'ELSS' | 'Debt Fund' | 'Equity Fund' | 'Hybrid Fund' | 'Index Fund' | 'ETF' | 'Gold ETF' | 'International Fund';
  subCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Multi Cap' | 'Flexicap' | 'Focused' | 'Contra' | 'Value' | 'Dividend Yield' | 'Gilt Fund' | 'Credit Risk' | 'Liquid Fund' | 'Money Market' | 'Overnight Fund' | 'Ultra Short Duration' | 'Short Duration' | 'Medium Duration' | 'Long Duration' | 'Dynamic Bond' | 'Corporate Bond' | 'Government Bond' | 'Infrastructure Bond' | 'Banking & PSU' | 'Gilt Fund with 10 year Constant Duration' | 'Floater Fund' | 'Conservative Hybrid' | 'Aggressive Hybrid' | 'Dynamic Asset Allocation' | 'Multi Asset Allocation' | 'Arbitrage' | 'Conservative' | 'Moderately Conservative' | 'Balanced' | 'Moderately Aggressive' | 'Aggressive' | 'Very Aggressive' | 'Solution Oriented' | 'Children\'s Fund' | 'Retirement Fund' | 'ELSS' | 'International' | 'Thematic' | 'Sectoral' | 'Contra' | 'Value' | 'Focused' | 'Large and Mid Cap' | 'Mid Cap' | 'Small Cap' | 'Flexicap' | 'Multi Cap' | 'Index Fund' | 'ETF' | 'Gold ETF' | 'International Equity' | 'Balanced Advantage' | 'Dynamic Asset Allocation' | 'Multi Asset Allocation';
  investmentAmount: number;
  currentValue: number;
  totalUnits: number;
  currentNav: number;
  navDate: string;
  purchaseNav: number;
  purchaseDate: string;
  investmentType: 'Lump Sum' | 'SIP' | 'STP' | 'SWP';
  sipAmount?: number;
  sipDate?: number;
  sipStatus: 'Active' | 'Paused' | 'Stopped' | 'Completed';
  sipEndDate?: string;
  totalInvestment: number;
  absoluteReturn: number;
  percentageReturn: number;
  annualizedReturn: number;
  xirr: number;
  benchmark: string;
  benchmarkReturn: number;
  outperformance: number;
  fundHouse: string;
  fundManager: string;
  inceptionDate: string;
  exitLoad: string;
  expenseRatio: number;
  aum: number;
  minimumInvestment: number;
  minimumSip: number;
  riskLevel: 'Very Low' | 'Low' | 'Moderate' | 'Moderately High' | 'High' | 'Very High';
  rating: number;
  starRating: number;
  goalTag: string;
  investmentObjective: string;
  portfolioConcentration: number;
  topHoldings: Array<{
    name: string;
    percentage: number;
    sector: string;
  }>;
  sectorAllocation: Array<{
    sector: string;
    percentage: number;
  }>;
  assetAllocation: {
    equity: number;
    debt: number;
    cash: number;
    others: number;
  };
  fundSize: 'Small' | 'Medium' | 'Large' | 'Very Large';
  liquidity: 'Daily' | 'T+1' | 'T+2' | 'T+3';
  tax Implications: {
    stcgRate: number;
    ltcgRate: number;
    dividendTaxRate: number;
    indexation: boolean;
  };
  sipRampUp?: {
    enabled: boolean;
    percentage: number;
    frequency: 'Monthly' | 'Quarterly' | 'Annually';
  };
  goalBased: boolean;
  goalName?: string;
  goalTarget?: number;
  goalTargetDate?: string;
  goalProgress: number;
  alertSettings: {
    sipDue: boolean;
    navChange: boolean;
    goalMilestone: boolean;
    targetAchievement: boolean;
  };
  taxSavingEligible: boolean;
  lockInPeriod?: number;
  dividendOptions: 'Growth' | 'Dividend' | 'Dividend Reinvestment';
  rebalancingFrequency: 'Quarterly' | 'Half Yearly' | 'Annually' | 'As Required';
  performanceMetrics: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    sinceInception: number;
    volatility: number;
    sharpeRatio: number;
    beta: number;
    alpha: number;
  };
  riskMetrics: {
    standardDeviation: number;
    maximumDrawdown: number;
    valueAtRisk: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
  };
  sustainabilityScore?: number;
  esgRating?: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  dividendHistory: Array<{
    date: string;
    amount: number;
    type: 'Dividend' | 'Bonus' | 'Split';
  }>;
  switchHistory: Array<{
    date: string;
    fromScheme: string;
    toScheme: string;
    amount: number;
    reason: string;
  }>;
  withdrawalHistory: Array<{
    date: string;
    amount: number;
    units: number;
    nav: number;
    type: 'Partial' | 'Full';
  }>;
  taxHarvesting: {
    enabled: boolean;
    thresholdAmount: number;
    lastHarvestDate?: string;
    totalHarvested: number;
  };
  autoRebalancing: {
    enabled: boolean;
    threshold: number;
    frequency: 'Monthly' | 'Quarterly' | 'Annually';
  };
  performanceAlerts: {
    underperformance: boolean;
    outperformance: boolean;
    benchmark: boolean;
    target: boolean;
  };
  research: {
    analystRating: string;
    recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    targetPrice: number;
    upsidePotential: number;
  };
  news: Array<{
    date: string;
    headline: string;
    impact: 'Positive' | 'Negative' | 'Neutral';
    source: string;
  }>;
  documents: Array<{
    type: 'Fact Sheet' | 'Scheme Information Document' | 'Annual Report' | 'KIM' | 'Addendum';
    date: string;
    url: string;
  }>;
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  nomineeDetails: Array<{
    name: string;
    relation: string;
    percentage: number;
  }>;
  transactionHistory: Array<{
    date: string;
    type: 'Purchase' | 'Sale' | 'Dividend' | 'Bonus' | 'Split' | 'Switch In' | 'Switch Out' | 'STP In' | 'STP Out' | 'SWP In' | 'SWP Out';
    amount: number;
    units?: number;
    nav?: number;
    price?: number;
    charges: number;
    tax: number;
    netAmount: number;
    status: 'Success' | 'Failed' | 'Pending';
  }>;
  comparisonSchemes: string[];
  watchlist: boolean;
  favorite: boolean;
  tags: string[];
  notes: string;
  lastUpdated: string;
  nextAction?: string;
  nextActionDate?: string;
  performanceScore: number;
  riskScore: number;
  liquidityScore: number;
  costScore: number;
  managementScore: number;
  overallScore: number;
}

interface YieldOptimization {
  id: string;
  currentYield: number;
  optimalYield: number;
  yieldGap: number;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
  actionRequired: string;
  estimatedImprovement: number;
  timeframe: string;
  risks: string[];
  alternatives: Array<{
    option: string;
    yield: number;
    risk: string;
    suitability: string;
  }>;
}

interface TaxCalculation {
  id: string;
  investmentType: string;
  financialYear: string;
  totalInvestment: number;
  elssInvested: number;
  taxSaving: number;
  applicableSection: string;
  limit: number;
  carriedForward: number;
  actualBenefit: number;
  recommendations: string[];
}

const FixedDepositInvestmentTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fixed-deposits' | 'investment-tracker' | 'yield-optimization' | 'tax-planning' | 'analytics' | 'settings'>('overview');
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [investments, setInvestments] = useState<InvestmentTracker[]>([]);
  const [yieldOptimizations, setYieldOptimizations] = useState<YieldOptimization[]>([]);
  const [taxCalculations, setTaxCalculations] = useState<TaxCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBank, setFilterBank] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('maturityDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchFixedDeposits();
    fetchInvestments();
    fetchYieldOptimizations();
    fetchTaxCalculations();
  }, []);

  const fetchFixedDeposits = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: FixedDeposit[] = [
        {
          id: '1',
          accountNumber: 'FD001234567890',
          customerName: 'John Doe',
          principal: 500000,
          interestRate: 7.25,
          tenure: 36,
          tenureUnit: 'months',
          maturityDate: '2027-03-15',
          currentValue: 621450,
          interestEarned: 121450,
          bank: 'State Bank of India',
          type: 'Regular FD',
          status: 'Active',
          renewalOption: 'Auto Renew',
          createdDate: '2024-03-15',
          nextInterestPayment: '2025-03-15',
          penaltyRate: 1.0,
          minimumBalance: 500000,
          prematureClosurePenalty: 1.0,
          compoundFrequency: 'Quarterly',
          bankBranch: 'Mumbai Main Branch',
          ifscCode: 'SBIN0001234',
          accountType: 'FD Account',
          mobileBanking: true,
          internetBanking: true,
          smsAlerts: true,
          autoDebit: false,
          maturityInstructions: 'Auto renew for same tenure',
          interestCompounding: 'Compound',
          partialWithdrawalAllowed: false,
          loanAgainstFD: true,
          nominationRegistered: true,
          photoIdUploaded: true,
          addressProofUploaded: true,
          incomeProofUploaded: true,
          kycVerified: true,
          riskRating: 'Low',
          expectedReturn: 7.25,
          actualReturn: 7.25,
          benchmarkComparison: 6.8,
          performanceRating: 4.2,
          alertsEnabled: true,
          maturityAlerts: true,
          interestPaymentAlerts: true,
          renewalAlerts: true,
          closureAlerts: false,
          documentLinks: ['https://example.com/fd1-certificate.pdf'],
          nomineeDetails: {
            name: 'Jane Doe',
            relation: 'Spouse',
            percentage: 100
          },
          specialConditions: 'Senior citizen special rate applicable'
        },
        {
          id: '2',
          accountNumber: 'FD009876543210',
          customerName: 'Alice Smith',
          principal: 1000000,
          interestRate: 8.0,
          tenure: 60,
          tenureUnit: 'months',
          maturityDate: '2028-12-31',
          currentValue: 1480248,
          interestEarned: 480248,
          bank: 'HDFC Bank',
          type: 'Tax Saver FD',
          status: 'Active',
          renewalOption: 'Manual',
          createdDate: '2023-12-31',
          penaltyRate: 0.5,
          minimumBalance: 1000000,
          prematureClosurePenalty: 0.5,
          taxDeductionRate: 10.0,
          compoundFrequency: 'Annually',
          bankBranch: 'Delhi Central',
          ifscCode: 'HDFC0001234',
          accountType: 'FD Account',
          mobileBanking: true,
          internetBanking: true,
          smsAlerts: true,
          autoDebit: true,
          maturityInstructions: 'Transfer to savings account',
          interestCompounding: 'Compound',
          partialWithdrawalAllowed: true,
          loanAgainstFD: true,
          nominationRegistered: true,
          photoIdUploaded: true,
          addressProofUploaded: true,
          incomeProofUploaded: true,
          kycVerified: true,
          riskRating: 'Low',
          expectedReturn: 8.0,
          actualReturn: 8.0,
          benchmarkComparison: 7.5,
          performanceRating: 4.5,
          alertsEnabled: true,
          maturityAlerts: true,
          interestPaymentAlerts: false,
          renewalAlerts: true,
          closureAlerts: true,
          documentLinks: ['https://example.com/fd2-certificate.pdf'],
          nomineeDetails: {
            name: 'Bob Smith',
            relation: 'Spouse',
            percentage: 100
          }
        },
        {
          id: '3',
          accountNumber: 'FD005556667778',
          customerName: 'Rajesh Kumar',
          principal: 750000,
          interestRate: 7.75,
          tenure: 24,
          tenureUnit: 'months',
          maturityDate: '2026-06-20',
          currentValue: 889125,
          interestEarned: 139125,
          bank: 'ICICI Bank',
          type: 'Corporate FD',
          status: 'Active',
          renewalOption: 'Auto Renew',
          createdDate: '2024-06-20',
          nextInterestPayment: '2025-06-20',
          penaltyRate: 0.75,
          minimumBalance: 750000,
          prematureClosurePenalty: 0.75,
          compoundFrequency: 'Quarterly',
          bankBranch: 'Bangalore IT Park',
          ifscCode: 'ICIC0001234',
          accountType: 'FD Account',
          mobileBanking: true,
          internetBanking: true,
          smsAlerts: true,
          autoDebit: false,
          maturityInstructions: 'Auto renew with interest payout',
          interestCompounding: 'Compound',
          partialWithdrawalAllowed: false,
          loanAgainstFD: true,
          nominationRegistered: false,
          photoIdUploaded: true,
          addressProofUploaded: true,
          incomeProofUploaded: true,
          kycVerified: true,
          riskRating: 'Medium',
          expectedReturn: 7.75,
          actualReturn: 7.75,
          benchmarkComparison: 7.0,
          performanceRating: 4.0,
          alertsEnabled: true,
          maturityAlerts: true,
          interestPaymentAlerts: true,
          renewalAlerts: true,
          closureAlerts: false,
          documentLinks: ['https://example.com/fd3-certificate.pdf'],
          specialConditions: 'Corporate client special rate'
        }
      ];
      
      setFixedDeposits(mockData);
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockData: InvestmentTracker[] = [
        {
          id: '1',
          schemeName: 'SBI Bluechip Fund - Growth',
          category: 'Mutual Fund',
          subCategory: 'Large Cap',
          investmentAmount: 100000,
          currentValue: 145600,
          totalUnits: 234.567,
          currentNav: 62.45,
          navDate: '2025-12-09',
          purchaseNav: 42.65,
          purchaseDate: '2023-06-15',
          investmentType: 'Lump Sum',
          totalInvestment: 100000,
          absoluteReturn: 45600,
          percentageReturn: 45.6,
          annualizedReturn: 21.8,
          xirr: 22.1,
          benchmark: 'NIFTY 100 TRI',
          benchmarkReturn: 38.2,
          outperformance: 7.4,
          fundHouse: 'SBI Mutual Fund',
          fundManager: 'Rohit Bansal',
          inceptionDate: '2006-02-07',
          exitLoad: '1% if redeemed within 1 year',
          expenseRatio: 1.85,
          aum: 52345670000,
          minimumInvestment: 5000,
          minimumSip: 500,
          riskLevel: 'Moderately High',
          rating: 4,
          starRating: 4,
          goalTag: 'Long Term Wealth Creation',
          investmentObjective: 'To generate long-term capital appreciation from a diversified portfolio of predominantly large cap companies.',
          portfolioConcentration: 58.5,
          topHoldings: [
            { name: 'Reliance Industries Ltd', percentage: 8.2, sector: 'Oil & Gas' },
            { name: 'HDFC Bank Ltd', percentage: 7.8, sector: 'Banking' },
            { name: 'Infosys Ltd', percentage: 7.5, sector: 'IT' },
            { name: 'ICICI Bank Ltd', percentage: 7.2, sector: 'Banking' },
            { name: 'TCS Ltd', percentage: 6.8, sector: 'IT' }
          ],
          sectorAllocation: [
            { sector: 'Banking', percentage: 22.5 },
            { sector: 'IT', percentage: 18.3 },
            { sector: 'Oil & Gas', percentage: 12.8 },
            { sector: 'Automobile', percentage: 8.7 },
            { sector: 'Pharma', percentage: 6.5 }
          ],
          assetAllocation: {
            equity: 95.2,
            debt: 3.8,
            cash: 1.0,
            others: 0.0
          },
          fundSize: 'Very Large',
          liquidity: 'T+1',
          taxImplications: {
            stcgRate: 15.0,
            ltcgRate: 10.0,
            dividendTaxRate: 10.0,
            indexation: false
          },
          goalBased: true,
          goalName: 'Retirement Planning',
          goalTarget: 5000000,
          goalTargetDate: '2040-06-15',
          goalProgress: 2.9,
          alertSettings: {
            sipDue: true,
            navChange: true,
            goalMilestone: true,
            targetAchievement: false
          },
          taxSavingEligible: false,
          dividendOptions: 'Growth',
          rebalancingFrequency: 'Quarterly',
          performanceMetrics: {
            oneYear: 24.8,
            threeYear: 16.5,
            fiveYear: 18.2,
            sinceInception: 14.7,
            volatility: 18.5,
            sharpeRatio: 1.15,
            beta: 0.95,
            alpha: 2.3
          },
          riskMetrics: {
            standardDeviation: 18.5,
            maximumDrawdown: -22.3,
            valueAtRisk: -8.5,
            sharpeRatio: 1.15,
            sortinoRatio: 1.68,
            calmarRatio: 0.89
          },
          sustainabilityScore: 72,
          esgRating: 'AA',
          dividendHistory: [],
          switchHistory: [],
          withdrawalHistory: [],
          taxHarvesting: {
            enabled: true,
            thresholdAmount: 10000,
            totalHarvested: 25000
          },
          autoRebalancing: {
            enabled: true,
            threshold: 5.0,
            frequency: 'Quarterly'
          },
          performanceAlerts: {
            underperformance: true,
            outperformance: true,
            benchmark: true,
            target: true
          },
          research: {
            analystRating: 'Outperform',
            recommendation: 'Buy',
            targetPrice: 68.5,
            upsidePotential: 9.7
          },
          news: [
            {
              date: '2025-12-05',
              headline: 'SBI MF launches new digital platform for investors',
              impact: 'Positive',
              source: 'Economic Times'
            }
          ],
          documents: [
            {
              type: 'Fact Sheet',
              date: '2025-11-30',
              url: 'https://example.com/factsheet.pdf'
            }
          ],
          kycStatus: 'Verified',
          bankDetails: {
            accountNumber: '1234567890',
            bankName: 'State Bank of India',
            ifscCode: 'SBIN0001234'
          },
          nomineeDetails: [
            {
              name: 'Priya Bansal',
              relation: 'Spouse',
              percentage: 100
            }
          ],
          transactionHistory: [
            {
              date: '2023-06-15',
              type: 'Purchase',
              amount: 100000,
              units: 234.567,
              nav: 42.65,
              charges: 100,
              tax: 0,
              netAmount: 100100,
              status: 'Success'
            }
          ],
          comparisonSchemes: ['Axis Bluechip Fund', 'HDFC Top 100 Fund'],
          watchlist: false,
          favorite: true,
          tags: ['Large Cap', 'Blue Chip', 'Growth'],
          notes: 'Strong long-term performer with consistent outperformance',
          lastUpdated: '2025-12-09',
          performanceScore: 8.5,
          riskScore: 6.2,
          liquidityScore: 9.0,
          costScore: 7.5,
          managementScore: 8.2,
          overallScore: 7.8
        },
        {
          id: '2',
          schemeName: 'Axis ELSS Tax Saver Fund - Growth',
          category: 'ELSS',
          subCategory: 'ELSS',
          investmentAmount: 150000,
          currentValue: 198750,
          totalUnits: 452.891,
          currentNav: 43.87,
          navDate: '2025-12-09',
          purchaseNav: 33.12,
          purchaseDate: '2023-01-10',
          investmentType: 'SIP',
          sipAmount: 12500,
          sipDate: 10,
          sipStatus: 'Active',
          sipEndDate: '2026-01-10',
          totalInvestment: 225000,
          absoluteReturn: -26250,
          percentageReturn: -11.7,
          annualizedReturn: -6.8,
          xirr: -6.5,
          benchmark: 'NIFTY 500 TRI',
          benchmarkReturn: -8.2,
          outperformance: -3.5,
          fundHouse: 'Axis Mutual Fund',
          fundManager: 'Ashish Naik',
          inceptionDate: '2009-01-01',
          exitLoad: 'NIL',
          expenseRatio: 2.25,
          aum: 12456789000,
          minimumInvestment: 500,
          minimumSip: 500,
          riskLevel: 'High',
          rating: 3,
          starRating: 3,
          goalTag: 'Tax Saving & Wealth Creation',
          investmentObjective: 'To generate long-term capital growth by investing predominantly in equity and equity related securities.',
          portfolioConcentration: 65.8,
          topHoldings: [
            { name: 'Infosys Ltd', percentage: 9.2, sector: 'IT' },
            { name: 'HDFC Bank Ltd', percentage: 8.8, sector: 'Banking' },
            { name: 'Reliance Industries Ltd', percentage: 8.5, sector: 'Oil & Gas' },
            { name: 'TCS Ltd', percentage: 7.9, sector: 'IT' },
            { name: 'ICICI Bank Ltd', percentage: 7.6, sector: 'Banking' }
          ],
          sectorAllocation: [
            { sector: 'IT', percentage: 25.3 },
            { sector: 'Banking', percentage: 22.1 },
            { sector: 'Oil & Gas', percentage: 12.8 },
            { sector: 'Automobile', percentage: 8.9 },
            { sector: 'Consumer Goods', percentage: 7.2 }
          ],
          assetAllocation: {
            equity: 97.5,
            debt: 1.5,
            cash: 1.0,
            others: 0.0
          },
          fundSize: 'Large',
          liquidity: 'T+1',
          taxImplications: {
            stcgRate: 15.0,
            ltcgRate: 10.0,
            dividendTaxRate: 10.0,
            indexation: false
          },
          lockInPeriod: 36,
          goalBased: true,
          goalName: 'Tax Saving',
          goalTarget: 1500000,
          goalTargetDate: '2026-01-10',
          goalProgress: 13.2,
          alertSettings: {
            sipDue: true,
            navChange: false,
            goalMilestone: true,
            targetAchievement: false
          },
          taxSavingEligible: true,
          dividendOptions: 'Growth',
          rebalancingFrequency: 'Quarterly',
          performanceMetrics: {
            oneYear: -12.5,
            threeYear: 8.7,
            fiveYear: 12.3,
            sinceInception: 13.8,
            volatility: 22.1,
            sharpeRatio: 0.68,
            beta: 1.08,
            alpha: -1.5
          },
          riskMetrics: {
            standardDeviation: 22.1,
            maximumDrawdown: -28.7,
            valueAtRisk: -12.8,
            sharpeRatio: 0.68,
            sortinoRatio: 0.85,
            calmarRatio: 0.43
          },
          sustainabilityScore: 68,
          esgRating: 'A',
          dividendHistory: [],
          switchHistory: [],
          withdrawalHistory: [],
          taxHarvesting: {
            enabled: false,
            thresholdAmount: 0,
            totalHarvested: 0
          },
          autoRebalancing: {
            enabled: false,
            threshold: 0,
            frequency: 'Quarterly'
          },
          performanceAlerts: {
            underperformance: true,
            outperformance: false,
            benchmark: true,
            target: false
          },
          research: {
            analystRating: 'Market Perform',
            recommendation: 'Hold',
            targetPrice: 48.5,
            upsidePotential: 10.6
          },
          news: [
            {
              date: '2025-12-03',
              headline: 'Axis MF reduces expense ratio for ELSS funds',
              impact: 'Positive',
              source: 'Moneycontrol'
            }
          ],
          documents: [
            {
              type: 'Fact Sheet',
              date: '2025-11-30',
              url: 'https://example.com/elss-factsheet.pdf'
            }
          ],
          kycStatus: 'Verified',
          bankDetails: {
            accountNumber: '0987654321',
            bankName: 'Axis Bank',
            ifscCode: 'AXIS0001234'
          },
          nomineeDetails: [
            {
              name: 'Rajesh Naik',
              relation: 'Self',
              percentage: 100
            }
          ],
          transactionHistory: [
            {
              date: '2023-01-10',
              type: 'Purchase',
              amount: 12500,
              units: 377.419,
              nav: 33.12,
              charges: 0,
              tax: 0,
              netAmount: 12500,
              status: 'Success'
            }
          ],
          comparisonSchemes: ['SBI Tax Advantage Fund', 'DSP Tax Saver Fund'],
          watchlist: true,
          favorite: false,
          tags: ['ELSS', 'Tax Saver', 'Lock-in'],
          notes: '3-year lock-in period, good for tax savings under 80C',
          lastUpdated: '2025-12-09',
          performanceScore: 6.2,
          riskScore: 8.5,
          liquidityScore: 7.0,
          costScore: 6.0,
          managementScore: 7.1,
          overallScore: 6.9
        }
      ];
      
      setInvestments(mockData);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchYieldOptimizations = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: YieldOptimization[] = [
        {
          id: '1',
          currentYield: 7.25,
          optimalYield: 8.5,
          yieldGap: 1.25,
          recommendation: 'Consider moving to higher-yield corporate FDs or explore tax-saving options',
          priority: 'High',
          actionRequired: 'Review and compare FD rates across banks',
          estimatedImprovement: 1.25,
          timeframe: '30 days',
          risks: ['Slightly higher risk with corporate FDs', 'Liquidity constraints'],
          alternatives: [
            {
              option: 'HDFC Corporate FD',
              yield: 8.25,
              risk: 'Medium',
              suitability: 'Good for medium-term goals'
            },
            {
              option: 'SBI Tax Saver FD',
              yield: 7.75,
              risk: 'Low',
              suitability: 'Tax benefits with decent returns'
            },
            {
              option: 'Recurring Deposit',
              yield: 7.0,
              risk: 'Low',
              suitability: 'Flexible investment option'
            }
          ]
        },
        {
          id: '2',
          currentYield: 8.0,
          optimalYield: 9.2,
          yieldGap: 1.2,
          recommendation: 'Explore alternative investment options like corporate bonds or debt funds',
          priority: 'Medium',
          actionRequired: 'Research corporate bond opportunities',
          estimatedImprovement: 1.2,
          timeframe: '60 days',
          risks: ['Market volatility', 'Credit risk with corporate instruments'],
          alternatives: [
            {
              option: 'Corporate Bond Fund',
              yield: 8.8,
              risk: 'Medium',
              suitability: 'Professional management with diversification'
            },
            {
              option: 'Banking & PSU Debt Fund',
              yield: 8.5,
              risk: 'Low',
              suitability: 'Stable returns with lower risk'
            },
            {
              option: 'Gilt Fund',
              yield: 7.8,
              risk: 'Very Low',
              suitability: 'Government securities, very safe'
            }
          ]
        }
      ];
      
      setYieldOptimizations(mockData);
    } catch (error) {
      console.error('Error fetching yield optimizations:', error);
    }
  };

  const fetchTaxCalculations = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockData: TaxCalculation[] = [
        {
          id: '1',
          investmentType: 'ELSS Mutual Funds',
          financialYear: '2024-25',
          totalInvestment: 150000,
          elssInvested: 150000,
          taxSaving: 46800,
          applicableSection: '80C',
          limit: 150000,
          carriedForward: 0,
          actualBenefit: 46800,
          recommendations: [
            'You have utilized full 80C limit through ELSS investments',
            'Consider additional tax-saving options if needed',
            'ELSS has lowest lock-in period (3 years) among 80C options'
          ]
        },
        {
          id: '2',
          investmentType: 'Tax Saver Fixed Deposits',
          financialYear: '2024-25',
          totalInvestment: 100000,
          elssInvested: 100000,
          taxSaving: 31200,
          applicableSection: '80C',
          limit: 150000,
          carriedForward: 50000,
          actualBenefit: 31200,
          recommendations: [
            'Consider increasing FD amount to utilize full 80C limit',
            'Compare with ELSS funds for potentially higher returns',
            'FD interest is taxable, unlike ELSS growth'
          ]
        }
      ];
      
      setTaxCalculations(mockData);
    } catch (error) {
      console.error('Error fetching tax calculations:', error);
    }
  };

  const getFilteredFixedDeposits = () => {
    let filtered = fixedDeposits.filter(fd => {
      const matchesSearch = fd.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fd.accountNumber.includes(searchTerm) ||
                           fd.bank.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBank = filterBank === 'all' || fd.bank === filterBank;
      const matchesStatus = filterStatus === 'all' || fd.status === filterStatus;
      
      return matchesSearch && matchesBank && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'maturityDate':
          aValue = new Date(a.maturityDate);
          bValue = new Date(b.maturityDate);
          break;
        case 'principal':
          aValue = a.principal;
          bValue = b.principal;
          break;
        case 'interestRate':
          aValue = a.interestRate;
          bValue = b.interestRate;
          break;
        case 'currentValue':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        default:
          aValue = a.maturityDate;
          bValue = b.maturityDate;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getFilteredInvestments = () => {
    let filtered = investments.filter(inv => {
      const matchesSearch = inv.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.fundHouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || inv.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'currentValue':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'percentageReturn':
          aValue = a.percentageReturn;
          bValue = b.percentageReturn;
          break;
        case 'xirr':
          aValue = a.xirr;
          bValue = b.xirr;
          break;
        case 'purchaseDate':
          aValue = new Date(a.purchaseDate);
          bValue = new Date(b.purchaseDate);
          break;
        default:
          aValue = a.currentValue;
          bValue = b.currentValue;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const calculateTotalPortfolioValue = () => {
    const fdTotal = fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0);
    const invTotal = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    return fdTotal + invTotal;
  };

  const calculateTotalReturns = () => {
    const fdReturns = fixedDeposits.reduce((sum, fd) => sum + fd.interestEarned, 0);
    const invReturns = investments.reduce((sum, inv) => sum + inv.absoluteReturn, 0);
    return fdReturns + invReturns;
  };

  const calculateWeightedAverageYield = () => {
    const fdTotal = fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0);
    const invTotal = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    
    if (fdTotal + invTotal === 0) return 0;
    
    const fdWeighted = (fixedDeposits.reduce((sum, fd) => sum + (fd.interestRate * fd.currentValue), 0) / fdTotal) * (fdTotal / (fdTotal + invTotal));
    const invWeighted = (investments.reduce((sum, inv) => sum + (inv.annualizedReturn * inv.currentValue), 0) / invTotal) * (invTotal / (fdTotal + invTotal));
    
    return fdWeighted + invWeighted;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getMaturityCountdown = (maturityDate: string) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Matured';
    if (diffDays === 0) return 'Matures Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotalPortfolioValue())}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
            <span className="text-sm text-gray-600 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotalReturns())}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+8.2%</span>
            <span className="text-sm text-gray-600 ml-1">annualized</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weighted Avg Yield</p>
              <p className="text-2xl font-bold text-gray-900">{calculateWeightedAverageYield().toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">FD: {fixedDeposits.length} | MF: {investments.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900">{fixedDeposits.filter(fd => fd.status === 'Active').length + investments.filter(inv => inv.sipStatus === 'Active' || inv.investmentType === 'Lump Sum').length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {fixedDeposits.filter(fd => fd.status === 'Active').length} FDs, {investments.filter(inv => inv.sipStatus === 'Active' || inv.investmentType === 'Lump Sum').length} MFs
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Fixed Deposits', value: fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0), color: '#3B82F6' },
                  { name: 'Mutual Funds', value: investments.reduce((sum, inv) => sum + inv.currentValue, 0), color: '#10B981' },
                  { name: 'Cash/Bank', value: 0, color: '#F59E0B' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {[
                  { name: 'Fixed Deposits', value: fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0), color: '#3B82F6' },
                  { name: 'Mutual Funds', value: investments.reduce((sum, inv) => sum + inv.currentValue, 0), color: '#10B981' },
                  { name: 'Cash/Bank', value: 0, color: '#F59E0B' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">FD Performance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fixedDeposits.map(fd => ({
                name: fd.bank.substring(0, 10),
                yield: fd.interestRate,
                value: fd.currentValue
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === 'yield' ? `${value}%` : formatCurrency(Number(value)), name === 'yield' ? 'Interest Rate' : 'Current Value']} />
                <Area type="monotone" dataKey="yield" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">MF Performance vs Benchmark</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investments.map(inv => ({
                name: inv.schemeName.substring(0, 15),
                portfolio: inv.percentageReturn,
                benchmark: inv.benchmarkReturn
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Return']} />
                <Bar dataKey="portfolio" fill="#10B981" name="Portfolio Return" />
                <Bar dataKey="benchmark" fill="#F59E0B" name="Benchmark Return" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Maturities & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming FD Maturities</h3>
          <div className="space-y-3">
            {fixedDeposits
              .filter(fd => {
                const maturity = new Date(fd.maturityDate);
                const today = new Date();
                const diffDays = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 90;
              })
              .slice(0, 5)
              .map((fd) => (
                <div key={fd.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{fd.bank}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(fd.principal)} @ {fd.interestRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{getMaturityCountdown(fd.maturityDate)}</p>
                    <p className="text-xs text-gray-500">{fd.maturityDate}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Optimization Opportunities</h3>
          <div className="space-y-3">
            {yieldOptimizations.slice(0, 3).map((opt) => (
              <div key={opt.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Current: {opt.currentYield}%</p>
                    <p className="text-sm text-gray-600">Optimal: {opt.optimalYield}%</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      opt.priority === 'High' ? 'bg-red-100 text-red-800' :
                      opt.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {opt.priority} Priority
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{opt.timeframe}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{opt.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFixedDeposits = () => (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name, account number, or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterBank}
            onChange={(e) => setFilterBank(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Banks</option>
            <option value="State Bank of India">State Bank of India</option>
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="ICICI Bank">ICICI Bank</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Matured">Matured</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="maturityDate">Sort by Maturity</option>
            <option value="principal">Sort by Principal</option>
            <option value="interestRate">Sort by Rate</option>
            <option value="currentValue">Sort by Value</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Fixed Deposits Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal & Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredFixedDeposits().map((fd) => (
                <tr key={fd.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{fd.customerName}</div>
                      <div className="text-sm text-gray-500">{fd.accountNumber}</div>
                      <div className="text-sm text-gray-500">{fd.bank}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(fd.principal)}</div>
                      <div className="text-sm text-gray-500">{fd.interestRate}% for {fd.tenure} {fd.tenureUnit}</div>
                      <div className="text-sm text-gray-500">{fd.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(fd.currentValue)}</div>
                      <div className="text-sm text-green-600">+{formatCurrency(fd.interestEarned)} earned</div>
                      <div className="text-sm text-gray-500">{fd.compoundFrequency} compounding</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{fd.maturityDate}</div>
                      <div className="text-sm text-gray-500">{getMaturityCountdown(fd.maturityDate)}</div>
                      {fd.nextInterestPayment && (
                        <div className="text-sm text-blue-600">Next interest: {fd.nextInterestPayment}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fd.status === 'Active' ? 'bg-green-100 text-green-800' :
                      fd.status === 'Matured' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fd.status}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">{fd.renewalOption}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvestmentTracker = () => (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by scheme name, fund house, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Mutual Fund">Mutual Fund</option>
            <option value="ELSS">ELSS</option>
            <option value="SIP">SIP</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="currentValue">Sort by Value</option>
            <option value="percentageReturn">Sort by Return</option>
            <option value="xirr">Sort by XIRR</option>
            <option value="purchaseDate">Sort by Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Investment Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(investments.reduce((sum, inv) => sum + inv.totalInvestment, 0))}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(investments.reduce((sum, inv) => sum + inv.currentValue, 0))}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(investments.reduce((sum, inv) => sum + inv.absoluteReturn, 0))}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg XIRR</p>
              <p className="text-xl font-bold text-gray-900">
                {investments.length > 0 ? 
                  (investments.reduce((sum, inv) => sum + inv.xirr, 0) / investments.length).toFixed(2) : '0.00'
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Details Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheme Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredInvestments().map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{inv.schemeName}</div>
                      <div className="text-sm text-gray-500">{inv.fundHouse}</div>
                      <div className="text-sm text-gray-500">{inv.category} - {inv.subCategory}</div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < inv.starRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{inv.starRating}/5</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(inv.totalInvestment)}</div>
                      <div className="text-sm text-gray-500">{inv.investmentType}</div>
                      {inv.investmentType === 'SIP' && inv.sipAmount && (
                        <div className="text-sm text-gray-500">SIP: {formatCurrency(inv.sipAmount)}</div>
                      )}
                      <div className="text-sm text-gray-500">Units: {inv.totalUnits.toFixed(3)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(inv.currentValue)}</div>
                      <div className="text-sm text-gray-500">NAV: ₹{inv.currentNav}</div>
                      <div className="text-sm text-gray-500">Date: {inv.navDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${inv.absoluteReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(inv.absoluteReturn)}
                      </div>
                      <div className={`text-sm ${inv.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(inv.percentageReturn)}
                      </div>
                      <div className="text-sm text-gray-500">XIRR: {inv.xirr.toFixed(2)}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 mr-2">vs Benchmark:</div>
                        <span className={`text-sm font-medium ${inv.outperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.outperformance >= 0 ? '+' : ''}{inv.outperformance.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">Risk: {inv.riskLevel}</div>
                      <div className="text-sm text-gray-500">Exp Ratio: {inv.expenseRatio}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal Tracking */}
      {investments.filter(inv => inv.goalBased).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal-Based Investment Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.filter(inv => inv.goalBased).map((inv) => (
              <div key={inv.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{inv.goalName}</h4>
                  <span className="text-sm text-gray-500">{inv.goalProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(inv.goalProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>{formatCurrency(inv.currentValue)} / {formatCurrency(inv.goalTarget || 0)}</div>
                  <div>Target Date: {inv.goalTargetDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderYieldOptimization = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Optimization Opportunities</h3>
        
        {yieldOptimizations.map((opt) => (
          <div key={opt.id} className="mb-6 p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Yield Gap: {opt.currentYield}% → {opt.optimalYield}%
                  </h4>
                  <p className="text-gray-600">Potential improvement: {opt.estimatedImprovement}%</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                opt.priority === 'High' ? 'bg-red-100 text-red-800' :
                opt.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {opt.priority} Priority
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Recommendation</h5>
                <p className="text-gray-700 mb-4">{opt.recommendation}</p>
                
                <h5 className="font-medium text-gray-900 mb-2">Action Required</h5>
                <p className="text-gray-700 mb-4">{opt.actionRequired}</p>
                
                <h5 className="font-medium text-gray-900 mb-2">Timeframe</h5>
                <p className="text-gray-700">{opt.timeframe}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Alternative Options</h5>
                <div className="space-y-2">
                  {opt.alternatives.map((alt, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{alt.option}</span>
                        <span className="text-green-600 font-medium">{alt.yield}%</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Risk: {alt.risk} | {alt.suitability}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Risks to Consider</h5>
              <div className="flex flex-wrap gap-2">
                {opt.risks.map((risk, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {risk}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <TrendingUp className="w-4 h-4 mr-2" />
                Implement Suggestion
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Yield Comparison Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current vs Optimal Yield Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yieldOptimizations.map(opt => ({
              name: `FD ${opt.id}`,
              current: opt.currentYield,
              optimal: opt.optimalYield,
              gap: opt.yieldGap
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, '']} />
              <Legend />
              <Bar dataKey="current" fill="#EF4444" name="Current Yield" />
              <Bar dataKey="optimal" fill="#10B981" name="Optimal Yield" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTaxPlanning = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Savings Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Savings Summary</h3>
          <div className="space-y-4">
            {taxCalculations.map((calc) => (
              <div key={calc.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{calc.investmentType}</h4>
                  <span className="text-green-600 font-bold">{formatCurrency(calc.taxSaving)}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Investment: {formatCurrency(calc.totalInvestment)}</div>
                  <div>Section: {calc.applicableSection}</div>
                  <div>Limit: {formatCurrency(calc.limit)}</div>
                  {calc.carriedForward > 0 && (
                    <div className="text-orange-600">Carried Forward: {formatCurrency(calc.carriedForward)}</div>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    calc.carriedForward === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {calc.carriedForward === 0 ? 'Full Utilization' : 'Partial Utilization'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Planning Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Planning Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Maximize 80C Benefits</h4>
              </div>
              <p className="text-sm text-blue-800">
                You have invested ₹{formatCurrency(taxCalculations.reduce((sum, calc) => sum + calc.totalInvestment, 0))} in 80C eligible instruments. 
                Consider increasing investments to utilize the full ₹1.5 lakh limit.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">ELSS Advantage</h4>
              </div>
              <p className="text-sm text-green-800">
                ELSS funds offer the shortest lock-in period (3 years) among 80C options with potential for higher returns. 
                Consider increasing ELSS allocation.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-900">Diversify Tax Savings</h4>
              </div>
              <p className="text-sm text-purple-800">
                Consider diversifying across ELSS, PPF, EPF, and Sukanya Samriddhi for balanced risk and returns while maximizing tax benefits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Impact Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Impact Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Saving</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxCalculations.map((calc) => (
                <tr key={calc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{calc.investmentType}</div>
                    <div className="text-sm text-gray-500">FY: {calc.financialYear}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(calc.totalInvestment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calc.applicableSection}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(calc.taxSaving)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((calc.taxSaving / calc.totalInvestment) * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      calc.carriedForward === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {calc.carriedForward === 0 ? 'Optimized' : 'Underutilized'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Portfolio Return</p>
              <p className="text-xl font-bold text-gray-900">
                {((calculateTotalReturns() / calculateTotalPortfolioValue()) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Risk-Adjusted Return</p>
              <p className="text-xl font-bold text-gray-900">1.24</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diversification Score</p>
              <p className="text-xl font-bold text-gray-900">7.8/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Volatility</p>
              <p className="text-xl font-bold text-gray-900">12.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={investments.map((inv, index) => ({
                month: `Month ${index + 1}`,
                value: inv.currentValue,
                target: inv.goalTarget || inv.currentValue * 1.2
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} name="Current Value" />
                <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Fixed Deposits', value: fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0), color: '#3B82F6' },
                    { name: 'Equity MF', value: investments.filter(inv => inv.subCategory.includes('Cap')).reduce((sum, inv) => sum + inv.currentValue, 0), color: '#10B981' },
                    { name: 'Debt MF', value: investments.filter(inv => inv.subCategory.includes('Debt') || inv.subCategory.includes('Bond')).reduce((sum, inv) => sum + inv.currentValue, 0), color: '#F59E0B' },
                    { name: 'ELSS', value: investments.filter(inv => inv.category === 'ELSS').reduce((sum, inv) => sum + inv.currentValue, 0), color: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {[
                    { name: 'Fixed Deposits', value: fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0), color: '#3B82F6' },
                    { name: 'Equity MF', value: investments.filter(inv => inv.subCategory.includes('Cap')).reduce((sum, inv) => sum + inv.currentValue, 0), color: '#10B981' },
                    { name: 'Debt MF', value: investments.filter(inv => inv.subCategory.includes('Debt') || inv.subCategory.includes('Bond')).reduce((sum, inv) => sum + inv.currentValue, 0), color: '#F59E0B' },
                    { name: 'ELSS', value: investments.filter(inv => inv.category === 'ELSS').reduce((sum, inv) => sum + inv.currentValue, 0), color: '#EF4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: 'Risk Score', value: 65, fill: '#F59E0B' }]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#F59E0B" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold">
                    6.5
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <h4 className="mt-2 font-medium text-gray-900">Overall Risk</h4>
            <p className="text-sm text-gray-600">Moderate Risk Profile</p>
          </div>

          <div className="text-center">
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: 'Volatility', value: 55, fill: '#3B82F6' }]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold">
                    12.3%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <h4 className="mt-2 font-medium text-gray-900">Volatility</h4>
            <p className="text-sm text-gray-600">Low to Moderate</p>
          </div>

          <div className="text-center">
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ name: 'Liquidity', value: 85, fill: '#10B981' }]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold">
                    8.5
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <h4 className="mt-2 font-medium text-gray-900">Liquidity</h4>
            <p className="text-sm text-gray-600">High Liquidity</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Maturity Alerts</h4>
              <p className="text-sm text-gray-600">Get notified 30 days before FD maturity</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Interest Payment Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when interest is credited</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">SIP Due Reminders</h4>
              <p className="text-sm text-gray-600">Get notified 3 days before SIP date</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Performance Alerts</h4>
              <p className="text-sm text-gray-600">Get notified of significant portfolio changes</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Renewal Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Renewal Option</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Auto Renew with Interest Payout</option>
              <option>Auto Renew with Interest Reinvestment</option>
              <option>Manual Renewal</option>
              <option>Maturity Payout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maturity Instructions</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter default maturity instructions..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="w-4 h-4 mr-2" />
                Export FD Data
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="w-4 h-4 mr-2" />
                Export Investment Data
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="w-4 h-4 mr-2" />
                Export Tax Report
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="w-4 h-4 mr-2" />
                Export Performance Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Fixed Deposit & Investment Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <PiggyBank className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Fixed Deposit & Investment Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                Add Investment
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'fixed-deposits', name: 'Fixed Deposits', icon: PiggyBank },
              { id: 'investment-tracker', name: 'Investment Tracker', icon: TrendingUp },
              { id: 'yield-optimization', name: 'Yield Optimization', icon: Target },
              { id: 'tax-planning', name: 'Tax Planning', icon: Calculator },
              { id: 'analytics', name: 'Analytics', icon: LineChart },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'fixed-deposits' && renderFixedDeposits()}
        {activeTab === 'investment-tracker' && renderInvestmentTracker()}
        {activeTab === 'yield-optimization' && renderYieldOptimization()}
        {activeTab === 'tax-planning' && renderTaxPlanning()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default FixedDepositInvestmentTracker;