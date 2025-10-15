// 客服系统多语言支持

export interface SupportTranslations {
  // 通用
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  close: string;
  
  // 客服窗口
  support: string;
  chat: string;
  contact: string;
  faq: string;
  startConversation: string;
  startChat: string;
  getHelp: string;
  
  // 聊天界面
  typeMessage: string;
  sendMessage: string;
  uploadFile: string;
  connecting: string;
  connected: string;
  offline: string;
  
  // 联系表单
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
  required: string;
  
  // 优先级
  low: string;
  normal: string;
  high: string;
  urgent: string;
  
  // 状态
  waiting: string;
  active: string;
  closed: string;
  
  // 消息
  welcomeMessage: string;
  offlineMessage: string;
  thankYou: string;
  
  // FAQ
  businessHours: string;
  trackOrder: string;
  paymentMethods: string;
  requestQuote: string;
  stillNeedHelp: string;
  
  // 评分
  rateExperience: string;
  rateConversation: string;
  additionalFeedback: string;
  submitRating: string;
  skip: string;
  
  // 通知
  newMessage: string;
  agentAssigned: string;
  sessionClosed: string;
  
  // AI回复
  aiAssistant: string;
  connectingAgent: string;
  
  // 错误消息
  fillRequiredFields: string;
  failedToSend: string;
  connectionError: string;
  fileUploadError: string;
  fileTooLarge: string;
  fileTypeNotAllowed: string;
}

export const translations: Record<string, SupportTranslations> = {
  en: {
    // 通用
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    
    // 客服窗口
    support: 'Support',
    chat: 'Chat',
    contact: 'Contact',
    faq: 'FAQ',
    startConversation: 'Start a conversation',
    startChat: 'Start Chat',
    getHelp: 'Get help from our support team',
    
    // 聊天界面
    typeMessage: 'Type your message...',
    sendMessage: 'Send Message',
    uploadFile: 'Upload File',
    connecting: 'Connecting...',
    connected: 'Connected',
    offline: 'Offline',
    
    // 联系表单
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    priority: 'Priority',
    required: 'Required',
    
    // 优先级
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    urgent: 'Urgent',
    
    // 状态
    waiting: 'Waiting',
    active: 'Active',
    closed: 'Closed',
    
    // 消息
    welcomeMessage: 'Hello! How can we help you today?',
    offlineMessage: "We're currently offline. Please leave a message and we'll get back to you.",
    thankYou: 'Thank you for contacting us!',
    
    // FAQ
    businessHours: 'What are your business hours?',
    trackOrder: 'How can I track my order?',
    paymentMethods: 'What payment methods do you accept?',
    requestQuote: 'How do I request a quote?',
    stillNeedHelp: 'Still need help?',
    
    // 评分
    rateExperience: 'Rate your experience',
    rateConversation: 'Rate this conversation',
    additionalFeedback: 'Additional feedback (optional)',
    submitRating: 'Submit',
    skip: 'Skip',
    
    // 通知
    newMessage: 'New message from',
    agentAssigned: 'Support Agent Assigned',
    sessionClosed: 'Support Session Closed',
    
    // AI回复
    aiAssistant: 'AI Assistant',
    connectingAgent: 'Connecting you with an agent...',
    
    // 错误消息
    fillRequiredFields: 'Please fill in all required fields',
    failedToSend: 'Failed to send message. Please try again.',
    connectionError: 'Connection error. Please check your internet connection.',
    fileUploadError: 'Failed to upload file. Please try again.',
    fileTooLarge: 'File size exceeds the maximum limit',
    fileTypeNotAllowed: 'File type not allowed'
  },
  
  zh: {
    // 通用
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    
    // 客服窗口
    support: '客服',
    chat: '聊天',
    contact: '联系',
    faq: '常见问题',
    startConversation: '开始对话',
    startChat: '开始聊天',
    getHelp: '获取我们支持团队的帮助',
    
    // 聊天界面
    typeMessage: '输入您的消息...',
    sendMessage: '发送消息',
    uploadFile: '上传文件',
    connecting: '连接中...',
    connected: '已连接',
    offline: '离线',
    
    // 联系表单
    name: '姓名',
    email: '邮箱',
    subject: '主题',
    message: '消息',
    priority: '优先级',
    required: '必填',
    
    // 优先级
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急',
    
    // 状态
    waiting: '等待中',
    active: '进行中',
    closed: '已关闭',
    
    // 消息
    welcomeMessage: '您好！我们如何为您提供帮助？',
    offlineMessage: '我们目前离线。请留言，我们会尽快回复您。',
    thankYou: '感谢您联系我们！',
    
    // FAQ
    businessHours: '你们的营业时间是什么？',
    trackOrder: '如何跟踪我的订单？',
    paymentMethods: '你们接受哪些支付方式？',
    requestQuote: '如何申请报价？',
    stillNeedHelp: '仍需要帮助？',
    
    // 评分
    rateExperience: '评价您的体验',
    rateConversation: '为此次对话评分',
    additionalFeedback: '其他反馈（可选）',
    submitRating: '提交',
    skip: '跳过',
    
    // 通知
    newMessage: '来自以下用户的新消息',
    agentAssigned: '客服代表已分配',
    sessionClosed: '客服会话已关闭',
    
    // AI回复
    aiAssistant: 'AI助手',
    connectingAgent: '正在为您连接客服代表...',
    
    // 错误消息
    fillRequiredFields: '请填写所有必填字段',
    failedToSend: '发送失败，请重试。',
    connectionError: '连接错误，请检查您的网络连接。',
    fileUploadError: '文件上传失败，请重试。',
    fileTooLarge: '文件大小超过最大限制',
    fileTypeNotAllowed: '不允许的文件类型'
  },
  
  es: {
    // 通用
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    
    // 客服窗口
    support: 'Soporte',
    chat: 'Chat',
    contact: 'Contacto',
    faq: 'Preguntas frecuentes',
    startConversation: 'Iniciar conversación',
    startChat: 'Iniciar Chat',
    getHelp: 'Obtén ayuda de nuestro equipo de soporte',
    
    // 聊天界面
    typeMessage: 'Escribe tu mensaje...',
    sendMessage: 'Enviar Mensaje',
    uploadFile: 'Subir Archivo',
    connecting: 'Conectando...',
    connected: 'Conectado',
    offline: 'Desconectado',
    
    // 联系表单
    name: 'Nombre',
    email: 'Correo electrónico',
    subject: 'Asunto',
    message: 'Mensaje',
    priority: 'Prioridad',
    required: 'Requerido',
    
    // 优先级
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
    
    // 状态
    waiting: 'Esperando',
    active: 'Activo',
    closed: 'Cerrado',
    
    // 消息
    welcomeMessage: '¡Hola! ¿Cómo podemos ayudarte hoy?',
    offlineMessage: 'Actualmente estamos desconectados. Por favor deja un mensaje y te responderemos.',
    thankYou: '¡Gracias por contactarnos!',
    
    // FAQ
    businessHours: '¿Cuáles son sus horarios de atención?',
    trackOrder: '¿Cómo puedo rastrear mi pedido?',
    paymentMethods: '¿Qué métodos de pago aceptan?',
    requestQuote: '¿Cómo solicito una cotización?',
    stillNeedHelp: '¿Aún necesitas ayuda?',
    
    // 评分
    rateExperience: 'Califica tu experiencia',
    rateConversation: 'Califica esta conversación',
    additionalFeedback: 'Comentarios adicionales (opcional)',
    submitRating: 'Enviar',
    skip: 'Omitir',
    
    // 通知
    newMessage: 'Nuevo mensaje de',
    agentAssigned: 'Agente de Soporte Asignado',
    sessionClosed: 'Sesión de Soporte Cerrada',
    
    // AI回复
    aiAssistant: 'Asistente IA',
    connectingAgent: 'Conectándote con un agente...',
    
    // 错误消息
    fillRequiredFields: 'Por favor completa todos los campos requeridos',
    failedToSend: 'Error al enviar mensaje. Por favor intenta de nuevo.',
    connectionError: 'Error de conexión. Por favor verifica tu conexión a internet.',
    fileUploadError: 'Error al subir archivo. Por favor intenta de nuevo.',
    fileTooLarge: 'El tamaño del archivo excede el límite máximo',
    fileTypeNotAllowed: 'Tipo de archivo no permitido'
  }
};

export function getSupportTranslations(locale: string = 'en'): SupportTranslations {
  return translations[locale] || translations.en;
}
