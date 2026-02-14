import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  Key,
  CreditCard,
  Cpu,
  History,
  Settings,
  ChevronRight,
  Copy,
  Plus,
  Zap,
  ShieldCheck,
  Globe,
  Menu,
  X,
  ExternalLink,
  Search,
  CheckCircle2,
  TrendingUp,
  Clock,
  LogOut,
  Send,
  Sparkles,
  Ticket,
  Package,
  ChevronDown,
  DollarSign,
  Terminal,
  Code,
  Layers,
  ShieldAlert,
  Moon,
  ArrowRight,
  Info,
  Bot,
  MessageCircle,
  Server,
  Play,
  Square,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  Wifi,
  Monitor,
  FileText,
  AlertCircle,
  Activity,
  Check
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type View = 'home' | 'dashboard' | 'tokens' | 'billing' | 'models' | 'logs' | 'settings' | 'playground' | 'instances';

interface Token {
  id: string;
  name: string;
  key: string;
  limit: number;
  used: number;
  status: 'active' | 'expired';
  created: string;
}

interface LogEntry {
  id: string;
  time: string;
  model: string;
  tokens: number;
  cost: number;
  status: number;
}

interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  officialInput: number; // USD per 1M
  officialOutput: number; // USD per 1M
  multiplier: number;
  status: 'online' | 'busy' | 'offline';
  description: string;
  tags: string[];
  category: 'OpenAI' | 'Claude' | 'DeepSeek' | 'Google' | 'Meta' | 'xAI' | 'Other';
}

// --- Mock Data ---
const MODELS: ModelInfo[] = [
  // --- OpenAI ---
  { id: 'gpt-4.1-nano', provider: 'OpenAI', name: 'GPT-4.1 Nano', officialInput: 0.1, officialOutput: 0.2, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['轻量', '极速'], category: 'OpenAI' },
  { id: 'gpt-4o-mini', provider: 'OpenAI', name: 'GPT-4o Mini', officialInput: 0.15, officialOutput: 0.6, multiplier: 0.8, status: 'online', description: 'model_desc_gpt', tags: ['聊天', '极速'], category: 'OpenAI' },
  { id: 'gpt-4o', provider: 'OpenAI', name: 'GPT-4o', officialInput: 5.0, officialOutput: 15.0, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['旗舰', '视觉'], category: 'OpenAI' },
  { id: 'gpt-5-nano', provider: 'OpenAI', name: 'GPT-5 Nano', officialInput: 0.3, officialOutput: 0.6, multiplier: 0.7, status: 'online', description: 'model_desc_gpt', tags: ['下世代', '极速'], category: 'OpenAI' },
  { id: 'gpt-5.1', provider: 'OpenAI', name: 'GPT-5.1', officialInput: 15.0, officialOutput: 45.0, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['旗舰', '专业'], category: 'OpenAI' },
  { id: 'gpt-5.1-codex', provider: 'OpenAI', name: 'GPT-5.1 Codex', officialInput: 12.0, officialOutput: 36.0, multiplier: 0.9, status: 'online', description: 'model_desc_gpt', tags: ['代码', '开发'], category: 'OpenAI' },
  { id: 'gpt-5.2', provider: 'OpenAI', name: 'GPT-5.2', officialInput: 20.0, officialOutput: 60.0, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['重磅', '智能'], category: 'OpenAI' },
  { id: 'gpt-5.2-chat', provider: 'OpenAI', name: 'GPT-5.2 Chat', officialInput: 15.0, officialOutput: 50.0, multiplier: 0.8, status: 'online', description: 'model_desc_gpt', tags: ['聊天', '创意'], category: 'OpenAI' },
  { id: 'gpt-4', provider: 'OpenAI', name: 'GPT-4', officialInput: 30.0, officialOutput: 60.0, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['经典', '可靠'], category: 'OpenAI' },
  { id: 'gpt-4-turbo', provider: 'OpenAI', name: 'GPT-4 Turbo', officialInput: 10.0, officialOutput: 30.0, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['视觉', '极速'], category: 'OpenAI' },
  { id: 'gpt-image-1', provider: 'OpenAI', name: 'GPT Image 1', officialInput: 1.0, officialOutput: 1.0, multiplier: 0.5, status: 'online', description: 'model_desc_gpt', tags: ['图像', '生成'], category: 'OpenAI' },
  { id: 'dall-e-3', provider: 'OpenAI', name: 'DALL-E 3', officialInput: 2.0, officialOutput: 2.0, multiplier: 0.5, status: 'online', description: 'model_desc_gpt', tags: ['绘画', '高级'], category: 'OpenAI' },
  { id: 'tts-1', provider: 'OpenAI', name: 'TTS-1', officialInput: 0.5, officialOutput: 0.5, multiplier: 0.1, status: 'online', description: 'model_desc_gpt', tags: ['语音', '极速'], category: 'OpenAI' },
  { id: 'tts-1-hd', provider: 'OpenAI', name: 'TTS-1 HD', officialInput: 1.0, officialOutput: 1.0, multiplier: 0.1, status: 'online', description: 'model_desc_gpt', tags: ['语音', '高清'], category: 'OpenAI' },
  { id: 'openai/gpt-oss-20b:free', provider: 'OpenAI', name: 'GPT OSS 20B', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_gpt', tags: ['免费', '开源'], category: 'OpenAI' },

  // --- Anthropic ---
  { id: 'anthropic/claude-sonnet-4.5', provider: 'Anthropic', name: 'Claude 4.5 Sonnet', officialInput: 3.0, officialOutput: 15.0, multiplier: 1.0, status: 'online', description: 'model_desc_claude', tags: ['聊天', '智能'], category: 'Claude' },
  { id: 'anthropic/claude-opus-4.5', provider: 'Anthropic', name: 'Claude 4.5 Opus', officialInput: 15.0, officialOutput: 75.0, multiplier: 1.0, status: 'online', description: 'model_desc_claude', tags: ['极致', '逻辑'], category: 'Claude' },
  { id: 'anthropic/claude-opus-4', provider: 'Anthropic', name: 'Claude 4 Opus', officialInput: 15.0, officialOutput: 75.0, multiplier: 0.8, status: 'online', description: 'model_desc_claude', tags: ['经典', '逻辑'], category: 'Claude' },

  // --- Google ---
  { id: 'gemini-3.0-flash', provider: 'Google', name: 'Gemini 3.0 Flash', officialInput: 0.1, officialOutput: 0.4, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['快闪', '多模态'], category: 'Google' },
  { id: 'google/gemini-3.0-flash-exp:free', provider: 'Google', name: 'Gemini 3.0 Flash Exp', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_gpt', tags: ['免费', '实验'], category: 'Google' },
  { id: 'google/gemini-2.5-pro', provider: 'Google', name: 'Gemini 2.5 Pro', officialInput: 3.5, officialOutput: 10.5, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['专业', '视觉'], category: 'Google' },
  { id: 'gemini-2.5-pro-exp-03-25', provider: 'Google', name: 'Gemini 2.5 Pro Exp', officialInput: 3.0, officialOutput: 9.0, multiplier: 0.5, status: 'online', description: 'model_desc_gpt', tags: ['实验', '专业'], category: 'Google' },
  { id: 'google/gemini-2.5-flash', provider: 'Google', name: 'Gemini 2.5 Flash', officialInput: 0.1, officialOutput: 0.3, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['极速', '高效'], category: 'Google' },
  { id: 'google/gemini-2.5-flash-lite', provider: 'Google', name: 'Gemini 2.5 Flash Lite', officialInput: 0.075, officialOutput: 0.3, multiplier: 0.8, status: 'online', description: 'model_desc_gpt', tags: ['轻量', '极速'], category: 'Google' },
  { id: 'google/gemini-2.5-pro-preview', provider: 'Google', name: 'Gemini 2.5 Pro Preview', officialInput: 2.0, officialOutput: 6.0, multiplier: 0.5, status: 'online', description: 'model_desc_gpt', tags: ['预览', '专业'], category: 'Google' },
  { id: 'google/gemini-3-flash-preview', provider: 'Google', name: 'Gemini 3 Flash Preview', officialInput: 0.5, officialOutput: 1.5, multiplier: 0.5, status: 'online', description: 'model_desc_gpt', tags: ['下世代', '快闪'], category: 'Google' },
  { id: 'google/gemini-3-pro-preview', provider: 'Google', name: 'Gemini 3 Pro Preview', officialInput: 5.0, officialOutput: 15.0, multiplier: 0.5, status: 'online', description: 'model_desc_gpt', tags: ['下世代', '专业'], category: 'Google' },
  { id: 'google/gemma-3-27b-it:free', provider: 'Google', name: 'Gemma 3 27B IT', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_gpt', tags: ['免费', '开源'], category: 'Google' },

  // --- DeepSeek ---
  { id: 'deepseek/deepseek-chat-v3.1', provider: 'DeepSeek', name: 'DeepSeek Chat V3.1', officialInput: 0.15, officialOutput: 0.45, multiplier: 1.0, status: 'online', description: 'model_desc_deepseek', tags: ['聊天', '低价'], category: 'DeepSeek' },
  { id: 'deepseek/deepseek-v3.2', provider: 'DeepSeek', name: 'DeepSeek V3.2', officialInput: 0.2, officialOutput: 0.6, multiplier: 0.8, status: 'online', description: 'model_desc_deepseek', tags: ['最新', '全球'], category: 'DeepSeek' },
  { id: 'deepseek/deepseek-r1', provider: 'DeepSeek', name: 'DeepSeek R1', officialInput: 2.0, officialOutput: 6.0, multiplier: 1.1, status: 'online', description: 'model_desc_deepseek', tags: ['逻辑', '首发'], category: 'DeepSeek' },
  { id: 'tngtech/deepseek-r1t-chimera:free', provider: 'DeepSeek', name: 'DeepSeek R1T Chimera', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_deepseek', tags: ['免费', '研究'], category: 'DeepSeek' },
  { id: 'tngtech/deepseek-r1t2-chimera:free', provider: 'DeepSeek', name: 'DeepSeek R1T2 Chimera', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_deepseek', tags: ['免费', '研究'], category: 'DeepSeek' },

  // --- xAI ---
  { id: 'x-ai/grok-code-fast-1', provider: 'xAI', name: 'Grok Code Fast 1', officialInput: 0.5, officialOutput: 1.5, multiplier: 0.5, status: 'online', description: 'model_desc_llama', tags: ['代码', '极速'], category: 'xAI' },
  { id: 'x-ai/grok-4', provider: 'xAI', name: 'Grok 4', officialInput: 5.0, officialOutput: 15.0, multiplier: 1.0, status: 'online', description: 'model_desc_llama', tags: ['旗舰', '睿智'], category: 'xAI' },
  { id: 'x-ai/grok-4-fast', provider: 'xAI', name: 'Grok 4 Fast', officialInput: 2.0, officialOutput: 6.0, multiplier: 1.0, status: 'online', description: 'model_desc_llama', tags: ['极速', '最新'], category: 'xAI' },
  { id: 'x-ai/grok-3-mini', provider: 'xAI', name: 'Grok 3 Mini', officialInput: 0.1, officialOutput: 0.3, multiplier: 1.0, status: 'online', description: 'model_desc_llama', tags: ['轻量', '极速'], category: 'xAI' },

  // --- Meta ---
  { id: 'meta-llama/llama-3.3-70b-instruct:free', provider: 'Meta', name: 'Llama 3.3 70B', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_llama', tags: ['免费', '开源'], category: 'Meta' },

  // --- Other ---
  { id: 'amazon/nova-2-lite-v1:free', provider: 'Amazon', name: 'Nova 2 Lite', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_llama', tags: ['免费', '轻量'], category: 'Other' },
  { id: 'qwen/qwen3-235b-a22b:free', provider: 'Alibaba', name: 'Qwen 3 235B', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_llama', tags: ['免费', '超强'], category: 'Other' },
];

const INITIAL_TOKENS: Token[] = [
  { id: '1', name: 'mock_token_name', key: 'sk-nova-xxxxxxxxxxxx4k9a', limit: -1, used: 125.40, status: 'active', created: '2024-03-15' },
];

const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', time: '2024-03-21 14:20:11', model: 'gpt-4o', tokens: 1520, cost: 0.0076, status: 200 },
];

// --- Components ---

const Card = ({ children, className = "", ...props }: { children?: React.ReactNode; className?: string;[key: string]: any }) => (
  <div className={`rounded-[1.5rem] border border-slate-100 shadow-sm transition-all duration-300 ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }: { children?: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

export function PrakasaAPIApp() {
  const [lang, setLang] = useState<'zh' | 'en'>('en');
  const [view, setView] = useState<View>('home');
  const [page, setPage] = useState<'openclaw' | 'api-key'>('openclaw');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [balance, setBalance] = useState(42.50);
  const [subscriptionQuota, setSubscriptionQuota] = useState(150.00);
  const [tokens] = useState<Token[]>(INITIAL_TOKENS);
  const [redeemCode, setRedeemCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundMessages, setPlaygroundMessages] = useState<{ role: string; content: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [rechargeCurrency, setRechargeCurrency] = useState<'USD' | 'CNY'>('USD');

  const t = {
    zh: {
      nav_home: "首页",
      nav_features: "服务优势",
      nav_pricing: "定价方案",
      nav_docs: "使用文档",
      nav_dashboard: "控制台",
      hero_headline: "One Key, All Models.",
      hero_subline: "全球顶尖大模型聚合平台",
      hero_desc: "集成 GPT-4o, Claude 4.5, DeepSeek, Llama 3 等前沿模型。国内直连秒开，企业级稳定保障，成本降低 70%。",
      hero_cta_start: "立即免费开始",
      hero_cta_bonus: "注册即送 $1.00 体验金",
      hero_cta_pricing: "查看 API 价格表",
      trust_devs_unit: "已稳定服务开发者",
      trust_tokens_unit: "累计处理 Token",
      trust_latency_unit: "平均响应延迟",
      adv1_title: "源头直供，击穿底价",
      adv1_desc: "通过 P2P 算力网络与大客户集采渠道，将推理成本压缩至极限。Llama 3 等模型价格仅为官方的 10%。",
      adv2_title: "官方同源，永不封号",
      adv2_desc: "采用企业级 API 聚合网关，多路主备切换（P2P + 官方兜底）。国内直连无网络波动，确保业务 24/7 在线。",
      adv3_title: "一行代码，无缝接入",
      adv3_desc: "100% 兼容 OpenAI 协议。无需修改逻辑，仅需替换 URL 和 Key。支持 LangChain, Cursor 等所有生态工具。",
      showcase_headline: "赋能下个世代的",
      showcase_headline_sub: "AI 驱动型开发体验",
      showcase_desc: "彻底告别复杂的跨境支付与账号封禁风险。Prakasa API 为追求极致效率的开发者提供稳定、高并发的模型接入能力，让 Claude 4.5 与 GPT-4o 成为你编程时的最强辅助，让每一行代码都充满灵感。",
      pricing_headline: "选择最适合您的订阅计划",
      pricing_subheadline: "按量计费，余额永久有效，支持全平台 100+ 大模型直连",
      pricing_tab_paygo: "按量付费",
      pricing_tab_sub: "包月订阅",
      sub_pro_label: "Pro 开发者版",
      sub_pro_target: "个人开发者 / 沉浸式翻译用户",
      sub_pro_price: "$ 48.00",
      sub_pro_unit: "/月",
      sub_pro_f1: "每日 $25.00 额度 (月总价值 $750)",
      sub_pro_f2: "每 5 小时可用 $12.50 额度",
      sub_pro_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      sub_pro_f4: "完美兼容 Cursor / VSCode / 翻译插件",
      sub_pro_f5: "标准 API 并发通道支持",
      sub_max_label: "Max 极速版",
      sub_max_target: "全职程序员 / 高频重度开发",
      sub_max_price: "$ 98.00",
      sub_max_unit: "/月",
      sub_max_f1: "每日 $40.00 额度 (月总价值 $1200)",
      sub_max_f2: "每 5 小时可用 $20.00 额度",
      sub_max_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      sub_max_f4: "完美兼容 Cursor / Windsurf / Codex",
      sub_max_f5: "优先 API 并发队列支持",
      sub_team_label: "Ultra 企业版",
      sub_team_target: "工作室 / 7x24小时自动化任务",
      sub_team_price: "$ 198.00",
      sub_team_unit: "/月",
      sub_team_f1: "每日 $100.00 额度 (月总价值 $3000)",
      sub_team_f2: "每 5 小时可用 $50.00 额度",
      sub_team_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      sub_team_f4: "支持多线程高并发调用",
      sub_team_f5: "企业级专属高速通道",
      paygo_c1_label: "自由充值",
      paygo_c1_price: "$ 1.00",
      paygo_c1_f1: "自定义金额充值",
      paygo_c1_f2: "按量计费，余额永久有效",
      paygo_c1_f3: "支持全平台所有模型",
      paygo_c1_f4: "无任何模型调用限制",
      paygo_c1_f5: "完美兼容 Cursor / VSCode 插件",
      paygo_c2_label: "轻量包",
      paygo_c2_price: "$ 6.90",
      paygo_c2_f1: "包含 $10.00 额度",
      paygo_c2_f2: "按量计费，余额永久有效",
      paygo_c2_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      paygo_c2_f4: "完美兼容 Cursor / VSCode 插件",
      paygo_c2_f5: "",
      paygo_c3_label: "标准包",
      paygo_c3_price: "$ 65.00",
      paygo_c3_f1: "包含 $100.00 额度",
      paygo_c3_f2: "按量计费，余额永久有效",
      paygo_c3_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      paygo_c3_f4: "完美兼容 Cursor / Windsurf / Codex",
      paygo_c3_f5: "",
      paygo_c4_label: "海量包",
      paygo_c4_price: "$ 119.00",
      paygo_c4_f1: "包含 $200.00 额度",
      paygo_c4_f2: "按量计费，余额永久有效",
      paygo_c4_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      paygo_c4_f4: "企业级专属高速通道支持",
      paygo_c4_f5: "",
      pricing_cta_recharge: "立即购买",
      pricing_paygo_label: "以下价格仅针对按量付费计费，订阅套餐参考套餐价格",
      pricing_paygo_start: "起",
      showcase_f1: "国内直连，毫秒级响应",
      showcase_f2: "模型全面，一键无缝切换",
      showcase_f3: "按量付费，成本极致压缩",
      showcase_f4: "完美适配 Cursor/VSCode",
      sub_validity_30: "额度有效期 30 天",
      sub_validity_90: "额度有效期 90 天",
      sub_standard_concurrency: "标准 API 并发支持",
      sub_cta_subscribe: "立即订阅",
      sub_cta_team: "立即订阅",
      dash_welcome: "欢迎回来！",
      dash_welcome_sub: "修改 Base URL 并替换 API Key 即可使用 100+ AI 模型",
      dash_base_url: "接口地址",
      dash_api_key: "API 密钥",
      dash_available_quota: "可用额度",
      dash_monthly_sub: "月度订阅",
      dash_general_balance: "通用余额",
      dash_recharge_online: "在线充值",
      dash_card_redeem: "卡密兑换",
      dash_redeem_desc: "输入16位卡密以激活您的账户额度。",
      dash_activate: "激活",
      dash_model_market: "模型列表",
      dash_price_per_m: "价格 / 1M Token",
      pricing_view_all_models: "查看全部模型价格",
      dash_playground_title: "在线调试 Playground",
      dash_playground_desc: "在此免费体验 Prakasa API 代理的模型性能，国内直连秒开。",
      dash_thinking: "思考中...",
      dash_input_placeholder: "输入消息，即刻开始调试...",
      dash_logs_title: "调用日志",
      dash_time: "时间",
      dash_model: "模型",
      dash_token_usage: "Token usage",
      dash_cost: "费用",
      dash_limit_infinite: "无限",
      dash_create_key: "创建新令牌",
      dash_stat_calls: "今日调用次数",
      dash_stat_tokens: "本月 Token 消耗",
      dash_stat_latency: "系统平均延迟",
      dash_stat_balance: "可用总额度",
      dash_token_manage: "令牌管理",
      dash_balance_title: "当前余额",
      dash_sub_balance: "订阅额度",
      dash_sub_balance_desc: "优先使用，套餐到期后清零",
      dash_paygo_balance: "按量余额",
      dash_paygo_balance_desc: "永久有效",
      dash_subscription_title: "当前订阅",
      dash_no_subscription: "暂无订阅",
      dash_redeem_code: "选购套餐",
      dash_recharge_now: "立即充值",
      dash_promo_badge: "首充优惠",
      dash_account_balance_title: "余额",
      dash_recharge_online_title: "在线充值",
      dash_recharge_amount_placeholder_usd: "输入美元金额 (Min. $1.00)",
      dash_recharge_amount_placeholder_cny: "输入人民币金额 (Min. ¥7.00)",
      dash_recharge_method_alipay: "支付宝支付",
      dash_recharge_method_usdt: "数字货币",
      dash_recharge_reminder_title: "充值须知",
      dash_recharge_reminder_1: "1. 充值实时到账，余额永久有效，不支持退款。",
      dash_recharge_reminder_2: "2. 请确保支付金额与输入金额一致。",
      dash_recharge_records_title: "充值记录",
      dash_th_order_id: "订单编号",
      dash_th_recharge_amount: "充值金额",
      dash_th_payment_amount: "实付金额",
      dash_th_payment_method: "支付方式",
      dash_th_created_at: "创建时间",
      dash_no_data: "暂无数据",
      dash_th_name: "名称 & 密钥",
      dash_th_status: "状态",
      dash_th_quota: "额度",
      dash_th_action: "操作",
      dash_market_th_model: "模型名称 / 提供商",
      dash_market_th_tags: "标签",
      dash_market_th_multiplier: "计费倍率",
      dash_market_th_official_price: "官方价格 ($/1M)",
      dash_market_th_our_price: "我们的价格 ($1M)",
      dash_market_th_action: "测试",
      dash_recharge_redeem_title: "兑换码充值",
      dash_recharge_redeem_placeholder: "请输入兑换码",
      dash_recharge_redeem_btn: "兑换",
      dash_th_topup_amount: "充值金额",
      dash_th_payment_gateway: "支付方式",
      dash_th_plan: "套餐",
      dash_th_redeem_code: "兑换码",
      dash_bill_btn: "账单",
      dash_recharge_method_crypto: "数字货币",
      dash_recharge_method_card: "信用卡 / 借记卡",
      nav_dash_overview: "API 总览",
      nav_dash_tokens: "API 密钥",
      nav_dash_plans: "订阅套餐",
      nav_dash_billing: "余额充值",
      nav_dash_models: "模型列表",
      nav_dash_playground: "在线调试",
      nav_dash_instances: "OpenClaw Dashboard",
      nav_dash_logs: "调用日志",
      nav_dash_logout: "退出登录",
      nav_dash_settings: "设置",
      model_desc_gpt: "旗舰全能模型",
      model_desc_claude: "顶尖推理能力",
      model_desc_deepseek: "极致性价比之王",
      model_desc_llama: "开源界最强模型",
      model_tag_paygo: "P2P 源头价",
      model_tag_free: "限时免费",
      alert_redeem_success: "兑换成功！",
      alert_redeem_invalid: "请输入有效的 16 位卡密",
      playground_no_content: "暂无内容",
      playground_timeout: "连接超时",
      trust_stat_power: "50 亿+",
      badge_recommended: "🔥 推荐方案",
      badge_highly_recommended: "🔥 强烈推荐",
      settings_coming_soon: "设置页面建设中...",
      status_online: "在线",
      status_busy: "拥挤",
      status_offline: "离线",
      mock_token_name: "生产环境-主Key",
      login_title: "登录到 Prakasa",
      login_subtitle: "选择一种方式开始",
      login_google: "使用 Google 登录",
      login_twitter: "使用 Twitter 连接",
      login_wallet: "连接钱包",
      login_terms: "登录即表示你同意我们的服务条款和隐私政策",
      login_logging_in: "正在登录...",
      login_or: "或者",
    },
    en: {
      nav_home: "Home",
      nav_features: "Features",
      nav_pricing: "Pricing",
      nav_docs: "Docs",
      nav_dashboard: "Console",
      hero_headline: "One Key, All Models.",
      hero_subline: "Global AI Aggregator",
      hero_desc: "Integrated GPT-4o, Claude 4.5, DeepSeek, Llama 3. Global direct connection, Enterprise security, Cost reduced by 70%.",
      hero_cta_start: "Start Free Now",
      hero_cta_bonus: "Get $1.00 credit on signup",
      hero_cta_pricing: "API Pricing",
      trust_devs_unit: "Developers Served",
      trust_tokens_unit: "Tokens Processed",
      trust_latency_unit: "Avg Latency",
      adv1_title: "Direct Source, Best Price",
      adv1_desc: "Cut costs via P2P compute networks and bulk procurement. Models starting at 10% of official prices.",
      adv2_title: "Official Source, No Bans",
      adv2_desc: "Enterprise API gateway with multi-route failover. Direct connection ensures 24/7 business continuity.",
      adv3_title: "One Line, Seamless Sync",
      adv3_desc: "100% OpenAI protocol compatible. Just swap Base URL and Key. Works with LangChain & Cursor.",
      showcase_headline: "Empowering Next-Gen",
      showcase_headline_sub: "AI-Driven Engineering",
      showcase_desc: "Say goodbye to complex cross-border payments and ban risks. Prakasa API provides stable, high-concurrency access for elite developers.",
      pricing_headline: "Choose Your Perfect Plan",
      pricing_subheadline: "Pay-as-you-go, never expires. Supports 100+ global models with direct connection.",
      badge_popular: "🔥 Popular",
      badge_enterprise: "Market Winner",
      footer_trust: "Trusted by enterprise engineers. 7-day money-back guarantee (unused credits only).",
      dash_welcome: "Welcome back!",
      dash_welcome_sub: "Change Base URL and replace API Key to use 100+ AI models",
      dash_base_url: "Base URL",
      dash_api_key: "API Key",
      dash_available_quota: "Available Quota",
      dash_monthly_sub: "Subscription",
      dash_general_balance: "Balance",
      dash_recharge_online: "Recharge Online",
      dash_card_redeem: "Redeem Card",
      dash_redeem_desc: "Enter 16-digit code to activate credit.",
      dash_activate: "Activate",
      dash_model_market: "Model List",
      dash_price_per_m: "Price / 1M Tokens",
      pricing_view_all_models: "View All Model Prices",
      dash_playground_title: "Playground",
      dash_playground_desc: "Test Prakasa API models for free with direct connection.",
      dash_thinking: "Thinking...",
      dash_input_placeholder: "Type a message...",
      dash_logs_title: "Logs",
      dash_time: "Time",
      dash_model: "Model",
      dash_token_usage: "Tokens",
      dash_cost: "Cost",
      dash_limit_infinite: "Infinite",
      dash_create_key: "Create New Key",
      dash_balance_title: "Current Balance",
      dash_subscription_title: "Current Subscription",
      dash_recharge_now: "Recharge",
      dash_promo_badge: "First Time Offer",
      dash_sub_balance: "Subscription",
      dash_sub_balance_desc: "Priority use, expires after plan ends",
      dash_paygo_balance: "Pay-As-You-Go",
      dash_paygo_balance_desc: "Never expires",
      dash_redeem_code: "Select Plan",
      dash_no_subscription: "None",
      showcase_f1: "Direct connection, ms response",
      showcase_f2: "Global models, 1-click switch",
      showcase_f3: "Pay-as-you-go, affordable",
      showcase_f4: "Perfect sync for Cursor/VSCode",
      pricing_tab_paygo: "Pay-As-You-Go",
      pricing_tab_sub: "Subscription",
      pricing_paygo_label: "Prices below apply only to pay-as-you-go billing; see plans for subscription pricing",
      pricing_paygo_start: "Start",
      pricing_pro_label: "Pro Plan",
      pricing_max_label: "Team Plan",
      pricing_ultra_label: "Enterprise Plan",
      sub_pro_label: "Pro Developer",
      sub_pro_target: "Individual Developers / Immersive Translate Users",
      sub_pro_price: "$ 48.00",
      sub_pro_unit: "/mo",
      sub_pro_f1: "Daily $25.00 quota ($750/mo value)",
      sub_pro_f2: "Available $12.50 every 5 hours",
      sub_pro_f3: "Supports Claude 4.5 & Codex 5.1 & Gemini 3 series",
      sub_pro_f4: "Perfect for Cursor / VSCode / Plugins",
      sub_pro_f5: "Standard API Concurrency Lane",
      sub_max_label: "Max Speed",
      sub_max_target: "Full-time Programmers / Heavy Development",
      sub_max_price: "$ 98.00",
      sub_max_unit: "/mo",
      sub_max_f1: "Daily $40.00 quota ($1200/mo value)",
      sub_max_f2: "Available $20.00 every 5 hours",
      sub_max_f3: "Supports Claude 4.5 & Codex 5.1 & Gemini 3 series",
      sub_max_f4: "Perfect for Cursor / Windsurf / Codex",
      sub_max_f5: "Priority API Concurrency Queue",
      sub_team_label: "Ultra Enterprise",
      sub_team_target: "Studios / 7x24 Automation",
      sub_team_price: "$ 198.00",
      sub_team_unit: "/mo",
      sub_team_f1: "Daily $100.00 quota ($3000/mo value)",
      sub_team_f2: "Available $50.00 every 5 hours",
      sub_team_f3: "Supports Claude 4.5 & Codex 5.1 & Gemini 3 series",
      sub_team_f4: "Supports Multi-threading High Concurrency",
      sub_team_f5: "Enterprise High Speed Lane",
      paygo_c1_label: "Flexible",
      paygo_c1_price: "$ 1.00",
      paygo_c1_f1: "Custom recharge amount",
      paygo_c1_f2: "Pay-as-you-go, never expires",
      paygo_c1_f3: "Supports all models across the platform",
      paygo_c1_f4: "No model call restrictions",
      paygo_c1_f5: "Cursor / VSCode plugin friendly",
      paygo_c2_label: "Light Pack",
      paygo_c2_price: "$ 6.90",
      paygo_c2_f1: "Includes $10.00 credit",
      paygo_c2_f2: "Pay-as-you-go, never expires",
      paygo_c2_f3: "Supports Claude 4.5 / Codex / Gemini 3 series",
      paygo_c2_f4: "Cursor / VSCode plugin compliant",
      paygo_c2_f5: "",
      paygo_c3_label: "Standard Pack",
      paygo_c3_price: "$ 65.00",
      paygo_c3_f1: "Includes $100.00 credit",
      paygo_c3_f2: "Pay-as-you-go, never expires",
      paygo_c3_f3: "Supports Claude 4.5 / Codex / Gemini 3 series",
      paygo_c3_f4: "Cursor / Windsurf / Codex friendly",
      paygo_c3_f5: "",
      paygo_c4_label: "Bulk Pack",
      paygo_c4_price: "$ 119.00",
      paygo_c4_f1: "Includes $200.00 credit",
      paygo_c4_f2: "Pay-as-you-go, never expires",
      paygo_c4_f3: "Supports Claude 4.5 / Codex / Gemini 3 series",
      paygo_c4_f4: "Enterprise High Speed Lane",
      paygo_c4_f5: "",
      pricing_cta_recharge: "Buy Now",
      nav_dash_overview: "API Dashboard",
      nav_dash_tokens: "API Keys",
      nav_dash_plans: "Plans",
      nav_dash_billing: "Top-up",
      nav_dash_models: "Models",
      nav_dash_playground: "Playground",
      nav_dash_instances: "OpenClaw Dashboard",
      nav_dash_logs: "Logs",
      nav_dash_logout: "Logout",
      dash_currency_usd: "USD",
      dash_currency_cny: "CNY",
      nav_dash_settings: "Settings",
      model_desc_gpt: "Flagship versatile model",
      model_desc_claude: "Top-tier reasoning",
      model_desc_deepseek: "Best value of-all-time",
      model_desc_llama: "Strongest open-source",
      model_tag_paygo: "P2P Pricing",
      model_tag_free: "Limited Free",
      alert_redeem_success: "Redemption successful!",
      alert_redeem_invalid: "Please enter a valid 16-digit code",
      playground_no_content: "No content",
      playground_timeout: "Connection timeout",
      trust_stat_power: "5 Billion+",
      badge_recommended: "🔥 Recommended",
      badge_highly_recommended: "🔥 Highly Recommended",
      settings_coming_soon: "Settings coming soon...",
      status_online: "Online",
      status_busy: "Busy",
      status_offline: "Offline",
      mock_token_name: "Production-MainKey",
      sub_cta_subscribe: "Subscribe Now",
      sub_cta_team: "Subscribe Now",
      login_title: "Sign in to Prakasa",
      login_subtitle: "Choose a method to get started",
      login_google: "Sign in with Google",
      login_twitter: "Connect with Twitter",
      login_wallet: "Connect Wallet",
      login_terms: "By signing in, you agree to our Terms of Service and Privacy Policy",
      login_logging_in: "Signing in...",
      login_or: "or",
      dash_stat_balance: "Available quota",
      dash_recharge_redeem_title: "Redeem Code",
      dash_recharge_redeem_placeholder: "Enter redeem code",
      dash_recharge_redeem_btn: "Redeem",
      dash_th_topup_amount: "Top-up Amount",
      dash_th_payment_gateway: "Payment Method",
      dash_th_plan: "Plan",
      dash_th_redeem_code: "Redeem Code",
      dash_bill_btn: "Invoice",
      dash_recharge_method_crypto: "Crypto",
      dash_recharge_method_card: "Credit Card",
      dash_recharge_online_title: "Online Recharge",
      dash_account_balance_title: "Balance",
      dash_recharge_reminder_title: "Recharge Notice",
      dash_recharge_reminder_1: "1. Credit arrives instantly, never expires, non-refundable.",
      dash_recharge_reminder_2: "2. Ensure payment matches input amount.",
    }
  }[lang];

  const totalEffectiveBalance = useMemo(() => balance + subscriptionQuota, [balance, subscriptionQuota]);

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setUser({
        name: 'Alex Chen',
        email: 'alex.chen@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIeVBi_aJQ6BnKCN2Bc8Zzm8Q7MNhPC6J4eDk5_=s96-c',
      });
      setIsLoggedIn(true);
      setIsLoggingIn(false);
      setShowLoginModal(false);
    }, 1200);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView('home');
  };

  const openLogin = () => setShowLoginModal(true);

  const handleRedeem = () => {
    if (redeemCode.length === 16) {
      setBalance(prev => prev + 50);
      setRedeemCode('');
      alert(t.alert_redeem_success);
    } else {
      alert(t.alert_redeem_invalid);
    }
  };

  const runPlayground = async () => {
    if (!playgroundInput.trim()) return;
    setPlaygroundMessages(prev => [...prev, { role: 'user', content: playgroundInput }]);
    setPlaygroundInput('');
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: playgroundInput,
      });
      setPlaygroundMessages(prev => [...prev, { role: 'assistant', content: response.text || t.playground_no_content }]);
    } catch (error) {
      setPlaygroundMessages(prev => [...prev, { role: 'assistant', content: t.playground_timeout }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- OpenClaw Content (Hosting Page) ---
  const OpenClawContent = () => {
    const [modelPlan, setModelPlan] = useState<'none' | 'eco' | 'balanced' | 'pro'>('none');
    const [tgConnected, setTgConnected] = useState(false);
    const [tgToken, setTgToken] = useState('');
    const [showTgModal, setShowTgModal] = useState(false);

    const machinePrice = 5;
    const machineSpec = '2 vCPU · 4 GB · 40 GB';

    const modelPlans = {
      none: { label: lang === 'zh' ? '不选择' : 'Skip', price: 0, desc: '', models: [], badge: '' },
      eco: {
        label: lang === 'zh' ? '经济模式' : 'Economy',
        price: 5,
        desc: lang === 'zh' ? 'P2P 模型，额度不限' : 'P2P models, unlimited',
        badge: '',
        models: ['Llama 3.1', 'Mistral', 'Qwen', 'DeepSeek', 'Gemma'],
        features: [lang === 'zh' ? '无限额度' : 'Unlimited quota'],
      },
      balanced: {
        label: lang === 'zh' ? '均衡模式' : 'Balanced',
        price: 29,
        desc: lang === 'zh' ? 'Gemini 为主 + 智能路由' : 'Gemini-focused + smart routing',
        badge: lang === 'zh' ? '推荐' : 'Best',
        models: ['gemini 3.0 flash', 'claude opus 4.5'],
        includes: lang === 'zh' ? '$50 顶尖模型 + 无限经济模型' : '$50 top models + unlimited economy models',
        features: [],
      },
      pro: {
        label: lang === 'zh' ? '专业模式' : 'Professional',
        price: 109,
        desc: lang === 'zh' ? '全部主流模型' : 'All premium models',
        badge: 'PRO',
        models: ['Claude 4.5', 'GPT-4o', 'o1', 'codex'],
        includes: lang === 'zh' ? '$200 顶尖模型 + 无限经济模型' : '$200 top models + unlimited economy models',
        features: [],
      },
    };
    const selectedModel = modelPlans[modelPlan];
    const totalPrice = machinePrice + selectedModel.price;

    const handleConnect = () => {
      if (tgToken.trim().length > 10) {
        setTgConnected(true);
        setShowTgModal(false);
      }
    };

    return (
      <div className="bg-[#08090e]">
        {/* Hero: Deploy Card */}
        <section className="pt-32 pb-28 relative">
          <div className="max-w-7xl mx-auto px-10 relative z-10">
            <div className="flex flex-col lg:flex-row items-start gap-20">
              {/* Left: Title */}
              <div className="lg:w-[42%] space-y-7 pt-4">
                <p className="text-[13px] font-semibold text-slate-500 tracking-[0.2em] uppercase">
                  {lang === 'zh' ? 'AI 托管服务' : 'Managed AI Hosting'}
                </p>
                <h1 className="text-5xl lg:text-[56px] font-extrabold text-white leading-[1.08] tracking-tight">
                  {lang === 'zh' ? (
                    <>你的 <span className="text-red-500">OpenClaw</span><br />一键上线</>
                  ) : (
                    <><span className="text-red-500">OpenClaw</span><br />One-Click Deploy</>
                  )}
                </h1>
                <p className="text-[15px] text-slate-500 font-medium leading-[1.7] max-w-md">
                  {lang === 'zh'
                    ? '不用装环境、不用买服务器、不用看文档。选择方案，连接你的 Telegram，付款即部署。'
                    : 'No setup, no server, no docs. Pick a plan, connect Telegram, pay & deploy.'}
                </p>

                {/* Trust indicators */}
                <div className="flex items-center gap-6 pt-2 text-[11px] font-medium text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {lang === 'zh' ? '独立容器' : 'Isolated'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    24/7
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {lang === 'zh' ? '自动更新' : 'Auto-update'}
                  </span>
                </div>

                {/* Terminal comparison - ultra minimal */}
                <div className="bg-[#0c0f16] rounded-xl p-4 border border-white/[0.06] font-mono text-[11px] space-y-0.5 mt-4">
                  <p className="text-slate-700 line-through">$ docker compose up — ERROR</p>
                  <p className="text-slate-700 line-through">$ pip install — version conflict</p>
                  <p className="text-slate-700 line-through">$ 14 errors, build failed</p>
                  <p className="text-emerald-500/80 font-medium mt-2">✓ {lang === 'zh' ? '我们帮你跳过所有这些' : 'We skip all of that'}</p>
                </div>
              </div>

              {/* Right: Deploy Card */}
              <div className="lg:w-[58%] w-full">
                <div className="bg-[#0c0f16] rounded-2xl border border-white/[0.06] p-5 relative">
                  <div className="space-y-4">

                    {/* Block 1: Default Machine - inline compact */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 bg-white/[0.1] rounded text-[10px] font-bold text-slate-200 flex items-center justify-center">1</span>
                        <span className="text-white font-bold text-[13px]">{lang === 'zh' ? '托管机器' : 'Hosting Machine'}</span>
                        <span className="ml-auto text-white font-bold text-[15px]">${machinePrice}<span className="text-slate-400 text-[10px] font-normal">/mo</span></span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group/machine">
                        <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover/machine:scale-110 transition-transform duration-500">
                          <Server size={12} className="text-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-[12px]">{lang === 'zh' ? '标准实例' : 'Standard Instance'}</p>
                          <p className="text-slate-400 text-[10px] font-mono">{machineSpec}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {[
                            { label: lang === 'zh' ? '隔离' : 'Isolated', icon: '🔒' },
                            { label: '24/7', icon: '⚡' },
                            { label: lang === 'zh' ? '自动更新' : 'Auto-update', icon: '🔄' },
                          ].map((item, i) => (
                            <span key={i} className="text-[9px] text-slate-400 font-medium">{item.icon} {item.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.04]"></div>

                    {/* Block 2: Model Package - 3 column cards */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 bg-white/[0.1] rounded text-[10px] font-bold text-slate-200 flex items-center justify-center">2</span>
                        <span className="text-white font-bold text-[13px]">{lang === 'zh' ? '模型套餐' : 'Model Package'}</span>
                        <span className="text-slate-400 text-[10px] font-medium ml-1">{lang === 'zh' ? '(可选)' : '(optional)'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(['eco', 'balanced', 'pro'] as const).map((key) => {
                          const plan = modelPlans[key];
                          const isSelected = modelPlan === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setModelPlan(isSelected ? 'none' : key)}
                              className={`text-left p-3 rounded-xl border transition-all duration-300 relative flex flex-col hover:scale-[1.02] active:scale-[0.98] ${isSelected
                                ? 'border-white/40 bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/10'
                                : 'border-white/[0.04] bg-transparent hover:border-white/20 hover:bg-white/[0.03]'
                                }`}
                            >
                              {plan.badge && (
                                <span className={`absolute -top-1.5 right-3 text-[7px] font-bold px-1.5 py-px rounded ${key === 'balanced' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                  {plan.badge}
                                </span>
                              )}

                              {/* Price + Label row */}
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-white bg-white' : 'border-slate-700'}`}>
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-[#0c0f16]"></div>}
                                </div>
                                <span className={`font-bold text-[15px] ${isSelected ? 'text-white' : 'text-slate-300'}`}>${plan.price}</span>
                                <span className="text-[9px] text-slate-400 font-normal">/mo</span>
                              </div>
                              <p className={`font-bold text-[11px] mb-2 ${isSelected ? 'text-white' : 'text-white/60'}`}>{plan.label}</p>

                              {/* Model Tags - vertical list */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {plan.models.map((m, i) => (
                                  <span key={i} className={`text-[8px] font-mono px-1 py-0.5 rounded ${isSelected ? 'bg-white/[0.08] text-slate-300' : 'bg-white/[0.05] text-slate-400'}`}>
                                    {m}
                                  </span>
                                ))}
                              </div>

                              {/* Includes previous */}
                              {'includes' in plan && plan.includes && (
                                <p className={`text-[9px] font-medium mb-1 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{plan.includes}</p>
                              )}

                              {/* Features */}
                              <div className="mt-auto pt-1 space-y-0.5">
                                {plan.features?.map((f, i) => (
                                  <p key={i} className={`text-[9px] font-medium ${isSelected ? 'text-slate-400' : 'text-slate-700'}`}>
                                    {key === 'eco' && i === 1 ? '∞ ' : ''}{key === 'balanced' && i === 0 ? '🧠 ' : ''}{key === 'pro' && i === 1 ? '⚡ ' : ''}{f}
                                  </p>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.04]"></div>

                    {/* Step 3: Connect bot - compact */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 bg-white/[0.1] rounded text-[10px] font-bold text-slate-200 flex items-center justify-center">3</span>
                        <span className="text-white font-bold text-[13px]">{lang === 'zh' ? '连接机器人' : 'Connect bot'}</span>
                      </div>

                      {!tgConnected ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowTgModal(true)}
                            className="flex-1 py-2.5 bg-white/[0.03] border border-white/[0.08] text-slate-400 rounded-xl font-medium text-[12px] hover:bg-white/[0.06] hover:border-white/20 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
                          >
                            <Send size={12} className="text-[#1a9edb] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            Telegram
                          </button>
                          <div className="flex-1 py-2.5 border border-white/[0.04] rounded-xl text-[12px] font-medium text-slate-400 flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                            <MessageCircle size={12} />
                            Discord
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-emerald-500/20 rounded-xl">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-[12px]">{lang === 'zh' ? 'Telegram 已连接' : 'Telegram connected'}</p>
                            <p className="text-slate-600 text-[9px] font-mono truncate">
                              {tgToken.slice(0, 8)}···{tgToken.slice(-6)}
                            </p>
                          </div>
                          <button
                            onClick={() => { setTgConnected(false); setTgToken(''); }}
                            className="text-slate-700 hover:text-slate-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.04]"></div>

                    {/* Step 4: Deploy - compact */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${tgConnected ? 'bg-white/[0.1] text-slate-200' : 'bg-white/[0.05] text-slate-500'}`}>4</span>
                          <span className={`font-bold text-[13px] ${tgConnected ? 'text-white' : 'text-slate-400'}`}>{lang === 'zh' ? '确认部署' : 'Deploy'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-[10px]">
                            <p className={`${tgConnected ? 'text-slate-300' : 'text-slate-500'} font-medium`}>{lang === 'zh' ? '机器' : 'Machine'} ${machinePrice}{modelPlan !== 'none' ? ` + ${selectedModel.label} $${selectedModel.price}` : ''}</p>
                          </div>
                          <p className="text-white text-xl font-bold tracking-tight">
                            ${totalPrice}<span className="text-slate-600 text-[10px] font-normal">/mo</span>
                          </p>
                        </div>
                      </div>
                      <button
                        disabled={!tgConnected}
                        className={`w-full py-3 rounded-xl font-bold text-[13px] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] ${tgConnected
                          ? 'bg-gradient-to-r from-white to-slate-200 text-[#08090e] hover:shadow-white/5'
                          : 'bg-white/[0.03] text-slate-700 border border-white/[0.04] cursor-not-allowed'
                          }`}
                      >
                        {tgConnected ? (
                          <>
                            <Zap size={14} className="animate-[bounce_2s_infinite]" />
                            {lang === 'zh' ? `立即部署 · $${totalPrice}/mo` : `Deploy Now · $${totalPrice}/mo`}
                          </>
                        ) : (
                          <>
                            <Send size={14} className="opacity-50" />
                            {lang === 'zh' ? '请先连接 Telegram' : 'Connect Telegram first'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What OpenClaw Can Do — 4x2 capability cards */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-10">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white mb-3">{lang === 'zh' ? 'OpenClaw 能做什么' : 'What OpenClaw Can Do For You'}</h2>
              <p className="text-slate-600 text-sm font-medium max-w-xl mx-auto">{lang === 'zh' ? '一个 24 小时在线的 AI，覆盖你数字生活的方方面面' : 'An always-on AI that works across your entire digital life'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Layers, title: lang === 'zh' ? '工作流自动化' : 'Workflow Automation', desc: lang === 'zh' ? '自动处理邮件、提醒、日程和重复性任务' : 'Automate emails, reminders, scheduling, and repetitive tasks — hands-free.' },
                { icon: Code, title: lang === 'zh' ? '代码 & 开发工具' : 'Code & Dev Tools', desc: lang === 'zh' ? '审查代码、生成测试、重构项目并自动管理仓库' : 'Review code, generate tests, refactor projects, and manage repos automatically.' },
                { icon: Globe, title: lang === 'zh' ? '浏览器控制' : 'Browser Control', desc: lang === 'zh' ? '填写表单、抓取数据、监控价格，像人一样操作网页' : 'Fill forms, scrape data, monitor prices, and navigate the web like a human.' },
                { icon: Cpu, title: lang === 'zh' ? '文件 & 系统管理' : 'File & System Mgmt', desc: lang === 'zh' ? '跨设备整理、重命名、转换与管理文件和文件夹' : 'Organize, rename, convert, and manage files and folders across your machine.' },
                { icon: ShieldCheck, title: lang === 'zh' ? '智能家居控制' : 'Smart Home Control', desc: lang === 'zh' ? '控制 Home Assistant，设置自动化，语音或文字管理你的智能家居' : 'Control Home Assistant, set automations, and manage your smart home.' },
                { icon: Terminal, title: lang === 'zh' ? 'App & API 对接' : 'App & API Integration', desc: lang === 'zh' ? '连接 Slack、Discord、GitHub、数据库和任意 API' : 'Connect to Slack, Discord, GitHub, databases, and any API.' },
                { icon: Sparkles, title: lang === 'zh' ? '内容创作' : 'Content Creation', desc: lang === 'zh' ? '生成图片、编辑视频、撰写文档、制作创意内容' : 'Generate images, edit videos, write documents, and produce creative assets.' },
                { icon: MessageCircle, title: lang === 'zh' ? '个人助理' : 'Personal Assistant', desc: lang === 'zh' ? '管理日历、记录笔记、追踪习惯、处理日常任务' : 'Manage your calendar, take notes, track habits, and handle daily tasks.' },
              ].map((item, i) => (
                <div key={i} className="group p-5 bg-[#0c0f16] rounded-2xl border border-white/[0.04] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                    <item.icon size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold text-[13px] mb-1.5">{item.title}</h3>
                  <p className="text-slate-600 text-[11px] leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: How it works — 3 steps */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-10">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white mb-3">{lang === 'zh' ? '如何开始' : 'How it works'}</h2>
              <p className="text-slate-600 text-sm font-medium">{lang === 'zh' ? '三步即可拥有你的专属 AI' : 'Three steps to your own always-on AI'}</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: lang === 'zh' ? '选择方案' : 'Pick a plan',
                  desc: lang === 'zh' ? '选择你的机器配置和模型套餐，立即锁定价格' : 'Pick your machine config and model package, lock in your rate.',
                  color: 'bg-white text-[#08090e]',
                  icon: Package,
                },
                {
                  step: '2',
                  title: lang === 'zh' ? '我们为你准备' : 'We prepare it',
                  desc: lang === 'zh' ? '我们自动创建一个专属实例，针对你的需求优化配置' : 'We spin up a dedicated instance configured and optimized just for you.',
                  color: 'bg-white/10 text-slate-400',
                  icon: Server,
                },
                {
                  step: '3',
                  title: lang === 'zh' ? '开始使用' : 'Start using it',
                  desc: lang === 'zh' ? '无需安装，无需配置。连接 Telegram Bot 即可开始' : 'No setup steps. No configuration checklist. Just connect your bot and go.',
                  color: 'bg-white/10 text-slate-400',
                  icon: Zap,
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center mx-auto mb-5 text-sm font-bold`}>
                    {item.step}
                  </div>
                  <div className="bg-[#0c0f16] rounded-2xl border border-white/[0.04] p-7 mb-5 flex items-center justify-center h-28">
                    <item.icon size={36} className="text-slate-700" strokeWidth={1} />
                  </div>
                  <h3 className="text-white font-bold text-[15px] mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-[12px] leading-relaxed font-medium max-w-[220px] mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Self-host vs Hosted comparison */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-10">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white mb-3">{lang === 'zh' ? '为什么选择托管' : 'Why choose hosted'}</h2>
              <p className="text-slate-600 text-sm font-medium">{lang === 'zh' ? '省去繁琐的部署和运维工作' : 'Skip the messy setup and maintenance'}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
              <div className="bg-[#0c0f16] p-8 space-y-4">
                <h3 className="text-lg font-bold text-white">{lang === 'zh' ? '自己部署' : 'Self-host'}</h3>
                <div className="space-y-2.5">
                  {[
                    lang === 'zh' ? '需要一台服务器' : 'Need a server',
                    lang === 'zh' ? '安装 Docker、Python 等' : 'Install Docker, Python',
                    lang === 'zh' ? '手动配置端口与环境' : 'Manual port & env config',
                    lang === 'zh' ? '出问题自己排查' : 'Debug issues yourself',
                    lang === 'zh' ? '手动更新' : 'Manual updates',
                  ].map((item, i) => (
                    <p key={i} className="text-slate-600 text-[13px] font-medium line-through decoration-slate-700">{item}</p>
                  ))}
                </div>
              </div>
              <div className="bg-[#0c0f16] p-8 space-y-4">
                <h3 className="text-lg font-bold text-white">{lang === 'zh' ? '使用托管' : 'Use hosting'}</h3>
                <div className="space-y-2.5">
                  {[
                    lang === 'zh' ? '30 秒内上线' : 'Online in 30 seconds',
                    lang === 'zh' ? '零配置，全部搞定' : 'Zero config, handled',
                    lang === 'zh' ? '24/7 在线不掉线' : '24/7, never sleeps',
                    lang === 'zh' ? '自动更新到最新版' : 'Auto-updates to latest',
                    lang === 'zh' ? '完全隔离，数据加密' : 'Isolated & encrypted',
                  ].map((item, i) => (
                    <p key={i} className="text-slate-400 text-[13px] font-medium flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>{item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Section 6: CTA */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="max-w-4xl mx-auto px-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">{lang === 'zh' ? '现在就开始。' : 'Start now.'}</h2>
            <p className="text-slate-600 text-sm font-medium mb-8">{lang === 'zh' ? '30 秒部署，随时取消。从 $5/月 起。' : '30-second deploy. Cancel anytime. From $5/mo.'}</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3 bg-white text-[#08090e] rounded-xl font-semibold text-sm hover:bg-white/90 transition-all"
              >
                {lang === 'zh' ? '↑ 立即部署' : '↑ Deploy Now'}
              </button>
              <a href="#docs" className="px-8 py-3 bg-white/[0.04] text-slate-400 border border-white/[0.06] rounded-xl font-semibold text-sm hover:bg-white/[0.08] hover:text-white transition-all">
                {lang === 'zh' ? '查看文档' : 'View Docs'}
              </a>
            </div>
          </div>
        </section>
        {/* Connect Telegram Modal */}
        {showTgModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-[#08090e]/80 backdrop-blur-xl" onClick={() => { setShowTgModal(false); setTgToken(''); }} />
            <div className="relative w-full max-w-lg bg-[#0c0f16] border border-white/[0.08] rounded-3xl p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#229ED9]/10 rounded-2xl flex items-center justify-center">
                  <Send size={24} className="text-[#229ED9]" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Connect Telegram</h3>
              </div>

              {/* Tutorial Steps */}
              <div className="mb-8">
                <p className="text-white font-semibold text-[15px] mb-5">
                  {lang === 'zh' ? 'How to get your bot token?' : 'How to get your bot token?'}
                </p>
                <ol className="space-y-4 text-slate-400 text-[14px] leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-slate-600 font-bold shrink-0">1.</span>
                    <span>
                      {lang === 'zh' ? '打开 Telegram 并前往 ' : 'Open Telegram and go to '}
                      <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#229ED9] underline underline-offset-2 hover:text-[#229ED9]/80 transition-colors">@BotFather</a>
                      {lang === 'zh' ? '。' : '.'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-600 font-bold shrink-0">2.</span>
                    <span>
                      {lang === 'zh' ? '开始对话并输入 ' : 'Start a chat and type '}
                      <code className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-slate-300 text-[13px] font-mono">/newbot</code>
                      {lang === 'zh' ? '。' : '.'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-600 font-bold shrink-0">3.</span>
                    <span>{lang === 'zh' ? '按提示为你的 Bot 命名并选择用户名。' : 'Follow the prompts to name your bot and choose a username.'}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-600 font-bold shrink-0">4.</span>
                    <span>{lang === 'zh' ? 'BotFather 会向你发送 Bot Token。复制整段 Token（一串数字和字母）。' : 'BotFather will send you a message with your bot token. Copy the entire token (it looks like a long string of numbers and letters).'}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-600 font-bold shrink-0">5.</span>
                    <span>{lang === 'zh' ? '将 Token 粘贴到下方输入框，点击 Save & Connect。' : 'Paste the token in the field below and click Save & Connect.'}</span>
                  </li>
                </ol>
              </div>

              {/* Token Input */}
              <div className="space-y-3">
                <p className="text-white font-semibold text-[14px]">Enter bot token</p>
                <input
                  type="text"
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-[14px] font-mono placeholder:text-slate-700 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Save & Connect Button */}
              <button
                onClick={handleConnect}
                disabled={tgToken.trim().length < 10}
                className="w-full mt-6 py-4 bg-white/[0.06] border border-white/[0.08] text-white rounded-xl font-bold text-[14px] hover:bg-white/[0.1] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Save & Connect
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </div>
        )}

      </div>
    );
  };

  // --- API Key Content ---
  const ApiKeyContent = () => {
    const [pricingTab, setPricingTab] = useState<'paygo' | 'sub'>('paygo');
    return (
      <div className="bg-[#08090e]">

        {/* Hero Section - Typography driven */}
        <section className="pt-36 pb-20 relative">
          <div className="max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-start justify-between gap-16">
            <div className="lg:w-1/2 space-y-8 z-10">
              <p className="text-[13px] font-semibold text-slate-500 tracking-[0.2em] uppercase">
                API Platform
              </p>
              <h1 className="text-5xl lg:text-[56px] font-extrabold text-white leading-[1.08] tracking-tight">
                {t.hero_headline}<br />
                <span className="text-red-500">{t.hero_subline}</span>
              </h1>
              <p className="text-[15px] text-slate-500 font-medium leading-[1.7] max-w-lg">
                {t.hero_desc}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-4">
                <button
                  onClick={openLogin}
                  className="flex flex-col items-center justify-center px-8 py-4 bg-white text-[#08090e] rounded-xl transition-all hover:bg-white/90"
                >
                  <span className="text-sm font-bold">{t.hero_cta_start}</span>
                  <span className="text-[10px] font-medium opacity-60 mt-0.5">{t.hero_cta_bonus}</span>
                </button>
                <a
                  href="#pricing"
                  className="flex items-center justify-center px-8 py-4 bg-white/[0.03] text-slate-400 border border-white/[0.06] rounded-xl text-sm font-semibold hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-center"
                >
                  {t.hero_cta_pricing}
                </a>
              </div>

              {/* Trust Bar - minimal */}
              <div className="pt-8 flex flex-wrap items-center gap-y-4 gap-x-8 text-slate-500 text-sm border-t border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <div>
                    <p className="text-white font-bold text-sm leading-none mb-0.5">12,000+</p>
                    <p className="text-[10px] text-slate-600 font-medium">{t.trust_devs_unit}</p>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/[0.06] hidden md:block"></div>
                <div>
                  <p className="text-white font-bold text-sm leading-none mb-0.5">{t.trust_stat_power}</p>
                  <p className="text-[10px] text-slate-600 font-medium">{t.trust_tokens_unit}</p>
                </div>
                <div className="h-6 w-px bg-white/[0.06] hidden md:block"></div>
                <div>
                  <p className="text-white font-bold text-sm leading-none mb-0.5">&lt; 200ms</p>
                  <p className="text-[10px] text-slate-600 font-medium">{t.trust_latency_unit}</p>
                </div>
              </div>
            </div>

            {/* Right: Animated Model Scroll & Decorative Cards */}
            <div className="lg:w-1/2 relative flex justify-center items-center py-10">
              <div className="relative w-full max-w-[500px] aspect-[4/3]">
                {/* Main Browser Frame */}
                <div className="absolute inset-0 bg-[#0c0f16] rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl">
                  {/* Top Bar */}
                  <div className="h-10 bg-white/[0.02] border-b border-white/[0.04] flex items-center px-5 gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/10"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/10"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/10"></span>
                  </div>

                  {/* Scrolling Content Mask */}
                  <div className="absolute inset-x-0 top-10 bottom-0 overflow-hidden px-8 py-6">
                    <div className="flex flex-col gap-4 animate-scroll-vertical">
                      {[
                        { name: "Claude 4.5", provider: "Anthropic", icon: <Bot size={18} />, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { name: "Gemini 2.5 Pro", provider: "Google", icon: <Sparkles size={18} />, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { name: "DeepSeek V3", provider: "DeepSeek", icon: <Cpu size={18} />, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                        { name: "GPT-4o", provider: "OpenAI", icon: <Zap size={18} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { name: "Llama 3.3", provider: "Meta", icon: <Activity size={18} />, color: "text-blue-400", bg: "bg-blue-400/10" },
                        { name: "Grok 4", provider: "xAI", icon: <Terminal size={18} />, color: "text-slate-300", bg: "bg-slate-300/10" },
                      ].concat([
                        { name: "Claude 4.5", provider: "Anthropic", icon: <Bot size={18} />, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { name: "Gemini 2.5 Pro", provider: "Google", icon: <Sparkles size={18} />, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { name: "DeepSeek V3", provider: "DeepSeek", icon: <Cpu size={18} />, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                        { name: "GPT-4o", provider: "OpenAI", icon: <Zap size={18} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { name: "Llama 3.3", provider: "Meta", icon: <Activity size={18} />, color: "text-blue-400", bg: "bg-blue-400/10" },
                        { name: "Grok 4", provider: "xAI", icon: <Terminal size={18} />, color: "text-slate-300", bg: "bg-slate-300/10" },
                      ]).map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl group hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                              {m.icon}
                            </div>
                            <div>
                              <p className="text-white font-bold text-[15px]">{m.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#50e3c2]/60">Ready to serve</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlays */}
                {/* 1. Supported Models Card (Top Right) */}
                <div className="absolute -right-4 -top-6 w-40 bg-[#0c0f16] rounded-2xl p-5 border border-white/[0.08] shadow-2xl z-20 flex flex-col items-center justify-center animate-float-slow transform translate-y-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-[0_8px_20px_rgba(79,70,229,0.3)]">
                    <Sparkles size={20} fill="white" />
                  </div>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Supported Models</p>
                  <p className="text-white text-2xl font-black">100+</p>
                </div>

                {/* 2. Code Snippet Card (Middle Right) */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 bg-[#0c0f16] border border-white/[0.1] rounded-2xl p-5 shadow-2xl z-20 w-64 animate-float-slow" style={{ animationDelay: '-2s' }}>
                  <div className="flex gap-1.5 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/40"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40"></span>
                  </div>
                  <div className="font-mono text-[11px] space-y-2">
                    <p><span className="text-blue-400">const</span> api <span className="text-slate-400">=</span> <span className="text-emerald-400/80">'prakasa.me'</span>;</p>
                    <p className="text-slate-600 italic">// Connecting...</p>
                    <p><span className="text-blue-400">await</span> api.<span className="text-emerald-400/80">deploy()</span>;</p>
                  </div>
                </div>

                {/* 3. Official Status (Bottom Left) */}
                <div className="absolute -left-8 -bottom-4 bg-[#0c0f16] rounded-2xl p-4 pr-6 border border-white/[0.08] shadow-2xl z-20 flex items-center gap-3.5 animate-float-slow" style={{ animationDelay: '-4s' }}>
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
                    <ShieldCheck size={20} fill="white" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">Security</p>
                    <p className="text-white text-[13px] font-black whitespace-nowrap">Official Enterprise Key</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Advantages - Minimal cards */}
        <section id="features" className="py-24 bg-[#08090e] border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { num: "01", title: t.adv1_title, desc: t.adv1_desc, icon: TrendingUp },
                { num: "02", title: t.adv2_title, desc: t.adv2_desc, icon: ShieldCheck },
                { num: "03", title: t.adv3_title, desc: t.adv3_desc, icon: Code },
              ].map((adv, i) => (
                <Card key={i} className="p-8 bg-[#0c0f16] border-white/[0.04] hover:border-white/[0.08] transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <adv.icon size={18} className="text-slate-600" />
                    <span className="text-[10px] font-mono text-slate-700">{adv.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{adv.title}</h3>
                  <p className="text-slate-600 text-[13px] font-medium leading-[1.7]">{adv.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Code Showcase - Minimal */}
        <section id="docs" className="py-24 bg-[#08090e] border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-start gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-slate-500 tracking-[0.2em] uppercase">Integration</p>
                <h2 className="text-3xl font-bold text-white leading-tight">
                  {t.showcase_headline}<br />{t.showcase_headline_sub}
                </h2>
              </div>
              <p className="text-[15px] text-slate-500 font-medium leading-[1.7]">
                {t.showcase_desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'f1', text: t.showcase_f1 },
                  { key: 'f2', text: t.showcase_f2 },
                  { key: 'f3', text: t.showcase_f3 },
                  { key: 'f4', text: t.showcase_f4 }
                ].map((f) => (
                  <div key={f.key} className="flex items-center gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span>
                    <span className="text-slate-400 font-medium text-[13px]">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-[#0c0f16] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="h-9 bg-white/[0.02] border-b border-white/[0.04] flex items-center px-4 gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  <span className="text-[10px] text-slate-600 ml-3 font-mono">developer@novahub:~/api-demo</span>
                </div>
                <pre className="p-5 text-[12px] font-mono leading-relaxed overflow-x-auto text-slate-400 no-scrollbar">
                  <code>
                    <span className="text-blue-400/80">$ curl</span> -X POST https://api.novahub.com/v1/chat/completions \<br />
                    -H <span className="text-emerald-400/70">"Content-Type: application/json"</span> \<br />
                    -H <span className="text-emerald-400/70">"Authorization: Bearer sk-your-api-key"</span> \<br />
                    -d <span className="text-slate-300">{'{'}</span><br />
                    <span className="text-slate-500">"model"</span>: <span className="text-emerald-400/70">"claude-3-5-sonnet-20241022"</span>,<br />
                    <span className="text-slate-500">"messages"</span>: [ {'{'} "role": "user", "content": "Hello!" {'}'} ]<br />
                    <span className="text-slate-300">{'}'}</span>'<br /><br />
                    <span className="text-blue-400/60">HTTP/1.1 200 OK</span><br />
                    <span className="text-slate-600">Content-Type: application/json</span><br /><br />
                    <span className="text-slate-300"> {'{'} </span><br />
                    <span className="text-slate-500">"id"</span>: <span className="text-emerald-400/70">"msg_01XYZ"</span>,<br />
                    <span className="text-slate-500">"model"</span>: <span className="text-emerald-400/70">"claude-3-5-sonnet"</span>,<br />
                    <span className="text-slate-500">"content"</span>: <span className="text-emerald-400/70">"Hello! How can I help you today?"</span><br />
                    <span className="text-slate-300"> {'}'} </span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Minimal */}
        <section id="pricing" className="py-24 bg-[#08090e] border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-10 text-center">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">{t.pricing_headline}</h2>
              <p className="text-slate-600 text-sm font-medium">{t.pricing_subheadline}</p>
            </div>

            {/* Pricing Tabs - Removed Subscription */}
            <div className="inline-flex bg-white/[0.03] p-1 rounded-xl mb-16 border border-white/[0.06]">
              <div
                className="px-6 py-2.5 rounded-lg font-semibold text-[13px] bg-white text-[#08090e]"
              >
                {t.pricing_tab_paygo}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 justify-center max-w-7xl mx-auto">
              <>
                {/* PAYGO Cards */}
                {[
                  { label: t.paygo_c1_label, price: t.paygo_c1_price, features: [t.paygo_c1_f1, t.paygo_c1_f2, t.paygo_c1_f3, t.paygo_c1_f4, t.paygo_c1_f5], recommended: false },
                  { label: t.paygo_c2_label, price: t.paygo_c2_price, features: [t.paygo_c2_f1, t.paygo_c2_f2, t.paygo_c2_f3, t.paygo_c2_f4], recommended: false },
                  { label: t.paygo_c3_label, price: t.paygo_c3_price, features: [t.paygo_c3_f1, t.paygo_c3_f2, t.paygo_c3_f3, t.paygo_c3_f4], recommended: true },
                  { label: t.paygo_c4_label, price: t.paygo_c4_price, features: [t.paygo_c4_f1, t.paygo_c4_f2, t.paygo_c4_f3, t.paygo_c4_f4], recommended: false },
                ].map((card, i) => (
                  <Card key={i} className={`p-7 bg-[#0c0f16] flex flex-col transition-all ${card.recommended ? 'border-white/20 relative' : 'border-white/[0.04]'}`}>
                    {card.recommended && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-2.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap z-20">
                        {t.badge_recommended}
                      </span>
                    )}
                    <div className="mb-5 text-left">
                      <h3 className="text-base font-bold text-white mb-0.5">{card.label}</h3>
                      <p className="text-slate-700 text-[10px] font-medium">{t.pricing_paygo_label}</p>
                    </div>
                    <div className="mb-6 text-left">
                      <span className="text-2xl font-bold text-white">{card.price}</span>
                      {i === 0 && <span className="text-slate-600 text-[10px] font-medium ml-1">{t.pricing_paygo_start}</span>}
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1 text-left">
                      {card.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-[12px] font-medium">
                          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 mt-1.5"></span>
                          <span className={j === 0 ? 'text-white' : 'text-slate-500'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-3 rounded-xl text-[13px] font-semibold transition-all ${card.recommended
                      ? 'bg-white text-[#08090e] hover:bg-white/90'
                      : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:bg-white/[0.06] hover:border-white/[0.1]'
                      }`}>
                      {t.pricing_cta_recharge}
                    </button>
                  </Card>
                ))}
              </>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={openLogin}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/[0.03] border border-white/[0.06] text-slate-400 rounded-xl font-medium text-[13px] transition-all hover:bg-white/[0.06] hover:border-white/[0.1]"
              >
                {t.pricing_view_all_models}
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-10 text-center text-slate-700 font-medium text-[12px]">
              {t.footer_trust}
            </div>
          </div>
        </section>
      </div>
    );
  };
  // --- Landing Page (Router + Navbar) ---
  const LandingPage = () => {
    return (
      <div className="bg-[#08090e] min-h-screen text-[#f0f4ff]">
        {/* Navbar - Minimal */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08090e]/80 backdrop-blur-xl h-16 px-10 flex items-center justify-between border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#08090e] shrink-0">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Prakasa</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-slate-500">
            <button onClick={() => setPage('openclaw')} className={`hover:text-white transition-colors ${page === 'openclaw' ? 'text-white' : ''}`}>OpenClaw</button>
            <button onClick={() => setPage('api-key')} className={`hover:text-white transition-colors ${page === 'api-key' ? 'text-white' : ''}`}>API Key</button>
            <a href="#docs" className="hover:text-white transition-colors">{t.nav_docs}</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="p-2 px-3 text-slate-600 hover:text-white transition-all flex items-center gap-1.5 font-medium text-[11px] bg-white/[0.03] rounded-lg border border-white/[0.06]"
            >
              <Globe size={14} />
              {lang === 'zh' ? 'EN' : 'ZH'}
            </button>

            {/* Login / User */}
            {isLoggedIn && user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-1 pr-3.5 bg-white/[0.03] border border-white/[0.06] rounded-full hover:bg-white/[0.06] transition-all"
              >
                <img src={user.avatar} className="w-6 h-6 rounded-full border border-white/10" alt="" />
                <span className="text-[11px] font-medium text-slate-400">{user.name}</span>
              </button>
            ) : (
              <button
                onClick={openLogin}
                className="px-4 py-2 text-slate-400 hover:text-white transition-all font-medium text-[12px] flex items-center gap-1.5"
              >
                {lang === 'zh' ? '登录' : 'Login'}
              </button>
            )}

            {/* Console - always visible */}
            <button
              onClick={() => isLoggedIn ? setView('instances') : openLogin()}
              className="px-4 py-2 bg-white text-[#08090e] rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-white/90 transition-all"
            >
              <LayoutDashboard size={13} />
              {t.nav_dashboard}
            </button>
          </div>
        </nav>

        {page === 'openclaw' ? <OpenClawContent /> : <ApiKeyContent />}

        {/* Footer - Minimal */}
        <footer className="bg-transparent border-t border-white/[0.04] py-12 px-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white"><Zap size={12} fill="currentColor" /></div>
              <span className="text-sm font-semibold text-slate-500 tracking-tight">OpenClaw</span>
            </div>
            <p className="text-slate-700 font-medium text-[11px]">© 2026 OpenClaw AI Engine. All rights reserved.</p>
            <div className="flex gap-6 text-[11px] text-slate-700 font-medium">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    );
  };



  const DashboardLayout = () => (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fb]">
      {/* Sidebar — clean, narrow */}
      <aside className="w-56 bg-white border-r border-slate-100/80 flex flex-col h-full shrink-0">
        <div className="px-5 h-14 flex items-center gap-2 border-b border-slate-100/60">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <Zap size={14} fill="white" />
          </div>
          <span className="text-[15px] font-bold text-slate-800 tracking-tight">Prakasa</span>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {[
            { id: 'instances', icon: Server, label: t.nav_dash_instances },
            { id: 'dashboard', icon: LayoutDashboard, label: t.nav_dash_overview },
            { id: 'tokens', icon: Key, label: t.nav_dash_tokens },
            { id: 'plans', icon: Package, label: t.nav_dash_plans },
            { id: 'billing', icon: CreditCard, label: t.nav_dash_billing },
            { id: 'models', icon: Cpu, label: t.nav_dash_models },
            { id: 'playground', icon: Sparkles, label: t.nav_dash_playground },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${view === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100/60">
          <div className="bg-[#f8f9fb] rounded-lg p-3 mb-2">
            <p className="text-[10px] font-medium text-slate-400 mb-0.5">{t.dash_available_quota}</p>
            <p className="text-lg font-bold text-slate-800 tracking-tight">${totalEffectiveBalance.toFixed(2)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-400 hover:text-rose-500 transition-colors text-[12px] font-medium rounded-lg hover:bg-slate-50"
          >
            <LogOut size={14} /> {t.nav_dash_logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100/80 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {view === 'dashboard' ? t.nav_dash_overview :
              view === 'tokens' ? t.nav_dash_tokens :
                view === 'plans' ? t.nav_dash_plans :
                  view === 'billing' ? t.nav_dash_billing :
                    view === 'models' ? t.nav_dash_models :
                      view === 'playground' ? t.nav_dash_playground :
                        view === 'instances' ? t.nav_dash_instances : view}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('home')}
              className="text-slate-400 hover:text-slate-700 transition-colors text-[12px] font-medium flex items-center gap-1.5"
            >
              <Globe size={13} />
              {lang === 'zh' ? '返回首页' : 'Home'}
            </button>
            {isLoggedIn && user && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
                <img src={user.avatar} className="w-6 h-6 rounded-full" alt="" />
                <span className="text-[12px] font-medium text-slate-500">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {view === 'dashboard' && <DashboardContent />}
          {view === 'tokens' && <TokensView />}
          {view === 'plans' && <PlansView />}
          {view === 'billing' && <BillingView />}
          {view === 'models' && <ModelsView />}
          {view === 'playground' && <PlaygroundView />}
          {view === 'instances' && <InstancesView />}
          {view === 'settings' && <div className="p-20 text-center text-slate-400 font-medium">{t.settings_coming_soon}</div>}
        </div>
      </main>
    </div>
  );

  const DashboardContent = () => (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner — clean */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">{t.dash_welcome}</h3>
          <p className="text-slate-500 text-[13px] font-medium">{t.dash_welcome_sub}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="bg-[#f8f9fb] rounded-lg px-4 py-3 border border-slate-100 flex-1 min-w-[200px] group relative">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[10px] font-medium text-slate-400">{t.dash_base_url}</p>
              <button
                onClick={() => { navigator.clipboard.writeText('https://api.novahub.com/v1'); alert('Copied!'); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700"
              >
                <Copy size={12} />
              </button>
            </div>
            <code className="text-[12px] font-medium text-slate-700 block truncate font-mono">https://api.novahub.com/v1</code>
          </div>
          <div className="bg-[#f8f9fb] rounded-lg px-4 py-3 border border-slate-100 flex-1 min-w-[200px] group relative">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[10px] font-medium text-slate-400">{t.dash_api_key}</p>
              <button
                onClick={() => { navigator.clipboard.writeText('sk-nova-xxxxxxxxxxxx4k9a'); alert('Copied!'); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700"
              >
                <Copy size={12} />
              </button>
            </div>
            <code className="text-[12px] font-medium text-slate-700 block truncate font-mono">sk-nova-••••••••4k9a</code>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[14px] text-slate-800">{t.dash_balance_title}</span>
              <Info size={13} className="text-slate-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">{t.dash_promo_badge}</span>
              <button className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-all">
                <CreditCard size={12} /> {t.dash_recharge_now}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-medium text-slate-700">{t.dash_paygo_balance}</span>
                  <span className="text-[10px] text-slate-400">{t.dash_paygo_balance_desc}</span>
                </div>
                <span className="text-[15px] font-semibold text-slate-800">$ {balance.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.dash_stat_calls, value: '1,240', icon: Globe, color: 'text-blue-600 bg-blue-50' },
          { label: t.dash_stat_tokens, value: '8.52M', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
          { label: t.dash_stat_latency, value: '18ms', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
          { label: t.dash_stat_balance, value: `$${totalEffectiveBalance.toFixed(2)}`, icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={16} />
            </div>
            <p className="text-slate-400 text-[10px] font-medium mb-0.5">{stat.label}</p>
            <p className="text-xl font-semibold text-slate-800 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const TokensView = () => (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{t.dash_token_manage}</h3>
        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-[12px] flex items-center gap-1.5 hover:bg-slate-800 transition-all">
          <Plus size={14} /> {t.dash_create_key}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9fb] border-b border-slate-100">
            <tr className="text-[11px] font-medium text-slate-400">
              <th className="px-6 py-3">{t.dash_th_name}</th>
              <th className="px-6 py-3">{t.dash_th_status}</th>
              <th className="px-6 py-3">{t.dash_th_quota}</th>
              <th className="px-6 py-3 text-right">{t.dash_th_action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tokens.map(token => (
              <tr key={token.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <p className="font-medium text-[13px] text-slate-800">{token.name === 'mock_token_name' ? t.mock_token_name : token.name}</p>
                  <code className="text-[11px] text-slate-400 font-mono">{token.key}</code>
                </td>
                <td className="px-6 py-4"><Badge color="green">{t[`status_${token.status}`] || token.status}</Badge></td>
                <td className="px-6 py-4 font-medium text-[13px] text-slate-700">{token.limit === -1 ? t.dash_limit_infinite : `$${token.limit}`}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Copy size={14} /></button>
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Settings size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-[15px] font-semibold text-slate-800 mb-4">{t.dash_logs_title}</h3>
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fb] border-b border-slate-100">
              <tr className="text-[11px] font-medium text-slate-400">
                <th className="px-6 py-3">{t.dash_time}</th>
                <th className="px-6 py-3">{t.dash_model}</th>
                <th className="px-6 py-3">{t.dash_token_usage}</th>
                <th className="px-6 py-3 text-right">{t.dash_cost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-[12px] font-medium text-slate-400">{log.time}</td>
                  <td className="px-6 py-4 font-medium text-[13px] text-slate-800">{log.model}</td>
                  <td className="px-6 py-4 font-medium text-[12px] text-slate-600">{log.tokens.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[13px] text-slate-800">${log.cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PlansView = () => (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <Info size={13} />
        </div>
        <p className="text-[11px] font-medium text-amber-700">
          {lang === 'zh'
            ? '重要提示：所有套餐仅支持 Claude 4.5 & Codex 5.1 & Gemini 3 系列模型调用。'
            : 'Notice: All plans only support Claude 4.5 & Codex 5.1 & Gemini 3 series models.'}
        </p>
      </div>

      {/* Pay-as-you-go */}
      <section>
        <h3 className="text-[15px] font-semibold text-slate-800 mb-4">{t.pricing_tab_paygo}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: t.paygo_c2_label, price: t.paygo_c2_price, features: [t.paygo_c2_f1, t.paygo_c2_f2, t.paygo_c2_f3, t.paygo_c2_f4], recommended: false, btnStyle: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900' },
            { label: t.paygo_c3_label, price: t.paygo_c3_price, features: [t.paygo_c3_f1, t.paygo_c3_f2, t.paygo_c3_f3, t.paygo_c3_f4], recommended: true, btnStyle: 'bg-slate-900 text-white hover:bg-slate-800' },
            { label: t.paygo_c4_label, price: t.paygo_c4_price, features: [t.paygo_c4_f1, t.paygo_c4_f2, t.paygo_c4_f3, t.paygo_c4_f4], recommended: false, btnStyle: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900' },
          ].map((plan, i) => (
            <div key={i} className={`bg-white rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5 relative ${plan.recommended ? 'border-2 border-slate-900 shadow-lg' : 'border border-slate-100'}`}>
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white px-2.5 py-0.5 rounded-full text-[9px] font-medium">
                  {t.badge_recommended}
                </div>
              )}
              <div className="mb-3">
                <h4 className="text-[15px] font-semibold text-slate-800 mb-0.5">{plan.label}</h4>
                <p className="text-slate-400 text-[10px] font-medium">{t.pricing_paygo_label}</p>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-800">{plan.price}</span>
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-[12px] font-medium">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className={j === 0 ? "text-slate-800 font-semibold" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg font-medium text-[12px] transition-all ${plan.btnStyle}`}>
                {t.pricing_cta_recharge}
              </button>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-slate-100" />

    </div>
  );

  const BillingView = () => (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Section - 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Online Recharge - Typography Centric */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between min-h-[200px]">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-6 uppercase tracking-wider">{t.dash_recharge_online_title}</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="1"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 font-bold text-4xl focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-100"
              />
              <span className="absolute right-0 bottom-3 text-slate-400 font-bold text-sm">USD</span>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <CreditCard size={14} />
              {t.dash_recharge_method_card}
            </button>
            <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              {t.dash_recharge_method_crypto}
            </button>
          </div>
        </div>

        {/* Balance Card - High Contrast Typography */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-[15px] font-bold text-slate-400 self-start mb-auto uppercase tracking-wider">{t.dash_account_balance_title}</h3>
          <div className="flex flex-col items-center justify-center mb-auto">
            <div className="flex items-start">
              <span className="text-slate-900 text-5xl font-black tracking-tighter">
                ${balance.toFixed(2)}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] font-bold mt-2 uppercase tracking-widest">Available Balance</p>
          </div>
        </div>

        {/* Notice Card - Minimalist Checklist */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col min-h-[200px]">
          <h3 className="text-[15px] font-bold text-slate-900 mb-6 uppercase tracking-wider">{t.dash_recharge_reminder_title}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <p className="text-[13px] font-bold text-slate-600">{t.dash_recharge_reminder_1.substring(3)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <p className="text-[13px] font-bold text-slate-600">{t.dash_recharge_reminder_2.substring(3)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Card - Simple Inline Components */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h3 className="text-[15px] font-bold text-slate-900 mb-8 uppercase tracking-wider">{t.dash_recharge_redeem_title}</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder={t.dash_recharge_redeem_placeholder}
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:bg-white focus:border-slate-900 outline-none transition-all"
          />
          <button
            onClick={handleRedeem}
            className="px-10 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            {t.dash_recharge_redeem_btn}
          </button>
        </div>
      </div>

      {/* Recharge Records - Orderly Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">{t.dash_recharge_records_title}</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all">
            {t.dash_bill_btn}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dash_th_topup_amount}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dash_th_payment_gateway}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dash_th_plan}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dash_th_status}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.dash_th_created_at}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center">
                    <History size={32} className="text-slate-100 mb-4" />
                    <p className="text-sm font-bold text-slate-300 italic">{t.dash_no_data}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ModelsView = () => {
    const categories = ['All', 'OpenAI', 'Claude', 'DeepSeek', 'Google', 'Meta', 'xAI', 'Other'];

    const filteredModels = useMemo(() => {
      return MODELS.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.provider.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    }, [searchQuery, selectedCategory]);

    return (
      <div className="p-8 space-y-5 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-0.5">{t.nav_dash_models}</h3>
            <p className="text-slate-400 text-[11px] font-medium">{t.pricing_paygo_label}</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input
              type="text"
              placeholder={lang === 'zh' ? "搜索模型..." : "Search models..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-lg focus:border-slate-300 outline-none font-medium text-[12px] w-full sm:w-52 transition-all"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium text-[11px] transition-all whitespace-nowrap ${selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200 hover:text-slate-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9fb] border-b border-slate-100">
                <tr className="text-[10px] font-medium text-slate-400">
                  <th className="px-6 py-3">{t.dash_market_th_model}</th>
                  <th className="px-6 py-3">{t.dash_market_th_tags}</th>
                  <th className="px-6 py-3 text-center">{t.dash_market_th_multiplier}</th>
                  <th className="px-6 py-3 text-right">{t.dash_market_th_official_price}</th>
                  <th className="px-6 py-3 text-right">{t.dash_market_th_our_price}</th>
                  <th className="px-6 py-3 text-center">{t.dash_market_th_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredModels.map(model => (
                  <tr key={model.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <Cpu size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-[13px] text-slate-800 leading-none mb-1">{model.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">{model.provider}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {model.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={model.multiplier === 0 ? 'green' : 'blue'}>
                        {model.multiplier === 0 ? t.model_tag_free : `x${model.multiplier.toFixed(1)}`}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                          <span className="text-[9px] opacity-50">In:</span>
                          <span>${model.officialInput.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                          <span className="text-[9px] opacity-50">Out:</span>
                          <span>${model.officialOutput.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-800 text-[12px]">
                          <span className="text-[9px] opacity-50">In:</span>
                          <span>${(model.officialInput * model.multiplier).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-800 text-[12px]">
                          <span className="text-[9px] opacity-50">Out:</span>
                          <span>${(model.officialOutput * model.multiplier).toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setView('playground')}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg font-medium text-[10px] hover:bg-slate-900 hover:text-white transition-all"
                      >
                        {t.dash_market_th_action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const PlaygroundView = () => (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {playgroundMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-slate-500 mb-4 border border-slate-100"><Sparkles size={32} /></div>
            <h4 className="text-lg font-semibold text-slate-800">{t.dash_playground_title}</h4>
            <p className="font-medium text-[13px] text-slate-500 max-w-xs mx-auto">{t.dash_playground_desc}</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {playgroundMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl font-medium text-[13px] ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-md' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-md'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-400">{t.dash_thinking}</div>}
          </div>
        )}
      </div>
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex gap-3 bg-[#f8f9fb] p-2.5 rounded-xl border border-slate-100 focus-within:border-slate-300 transition-all">
          <input
            type="text"
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runPlayground()}
            placeholder={t.dash_input_placeholder}
            className="flex-1 bg-transparent border-none outline-none font-medium text-slate-800 px-3 text-[14px]"
          />
          <button onClick={runPlayground} disabled={isGenerating} className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );

  // --- OpenClaw Instances ---
  const MOCK_INSTANCES = [
    {
      id: 'oc-b7207e38-6f2',
      name: 'clawbot',
      status: 'active' as const,
      provider: 'Google',
      model: 'google/gemini-3-flash-preview',
      vmSize: 'cpu-4-ram-8gb-storage-25gb',
      region: 'Auto',
      plugins: ['Telegram'],
      created: '2/14/2026, 10:17:22 AM',
      container: 'oc-b7207e38-6f2',
      proxyUrl: 'https://clawify-backend.up.railway.app/api/proxy/b7207e38-6f26-49cf-8253-4476d790bbd2/',
      gatewayToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0YW5jZV9pZCI6ImI3MjA3ZTM4',
      port: 18789,
    },
    {
      id: 'oc-a3f19c52-8d1',
      name: 'research-agent',
      status: 'stopped' as const,
      provider: 'OpenAI',
      model: 'openai/gpt-4o',
      vmSize: 'cpu-2-ram-4gb-storage-10gb',
      region: 'US-East',
      plugins: ['Slack', 'GitHub'],
      created: '2/10/2026, 3:45:10 PM',
      container: 'oc-a3f19c52-8d1',
      proxyUrl: 'https://clawify-backend.up.railway.app/api/proxy/a3f19c52-8d1e-4a72-b619-9912cf50aa31/',
      gatewayToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0YW5jZV9pZCI6ImEzZjE5YzUy',
      port: 18790,
    },
  ];

  const InstancesView = () => {
    const [activeTab, setActiveTab] = useState<'control' | 'details' | 'connection' | 'models'>('control');
    const [showToken, setShowToken] = useState(false);
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [configMode, setConfigMode] = useState<'json' | 'form'>('json');
    const [instanceApiKey, setInstanceApiKey] = useState('sk-nova-7bc9...x2f9');
    const instance = MOCK_INSTANCES[0];
    const [currentModel, setCurrentModel] = useState({ name: 'Claude Code 4.6', provider: 'Anthropic', status: 'online', type: 'Expert' });
    const [isSwitching, setIsSwitching] = useState(false);

    const handleSwitchModel = (m: any) => {
      if (isSwitching || m.name === currentModel.name) return;
      setIsSwitching(true);
      setTimeout(() => {
        setCurrentModel(m);
        setIsSwitching(false);
      }, 800);
    };

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-800">{instance.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${instance.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                {instance.status === 'active' ? (lang === 'zh' ? '\u8fd0\u884c\u4e2d' : 'Active') : (lang === 'zh' ? '\u5df2\u505c\u6b62' : 'Stopped')}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              {instance.status === 'active'
                ? (lang === 'zh' ? '\u4f60\u7684 Prakasa \u5b9e\u4f8b\u6b63\u5728\u8fd0\u884c\u4e14\u53ef\u8bbf\u95ee\u3002' : 'Your Prakasa instance is running and accessible.')
                : (lang === 'zh' ? '\u5b9e\u4f8b\u5df2\u505c\u6b62\uff0c\u70b9\u51fb\u542f\u52a8\u6062\u590d\u8fd0\u884c\u3002' : 'Instance is stopped. Click start to resume.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {instance.status === 'active' ? (
              <>
                <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500 hover:border-slate-200 transition-all flex items-center gap-1.5">
                  <RefreshCw size={12} /> {lang === 'zh' ? '\u91cd\u542f' : 'Restart'}
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[11px] font-medium text-amber-500 hover:border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-1.5">
                  <Square size={12} /> {lang === 'zh' ? '\u505c\u6b62' : 'Stop'}
                </button>
              </>
            ) : (
              <button className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] font-medium text-emerald-600 hover:bg-emerald-100 transition-all flex items-center gap-1.5">
                <Play size={12} /> {lang === 'zh' ? '\u542f\u52a8' : 'Start'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#f8f9fb] p-1 rounded-lg w-fit border border-slate-100">
          {([
            { id: 'control' as const, icon: Monitor, label: lang === 'zh' ? '\u63a7\u5236\u9762\u677f' : 'Control UI' },
            { id: 'details' as const, icon: FileText, label: lang === 'zh' ? '\u8be6\u7ec6\u4fe1\u606f' : 'Details' },
            { id: 'connection' as const, icon: Wifi, label: lang === 'zh' ? '\u8fde\u63a5\u4fe1\u606f' : 'Connection' },
            { id: 'models' as const, icon: Cpu, label: lang === 'zh' ? '\u6a21\u578b\u5217\u8868' : 'Models' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12px] font-medium transition-all ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Control UI Tab */}
        {activeTab === 'control' && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Monitor size={16} className="text-slate-500" />
                <div>
                  <h4 className="text-[14px] font-semibold text-slate-800">
                    {lang === 'zh' ? 'Prakasa \u63a7\u5236\u9762\u677f' : 'Prakasa Control UI'}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    {lang === 'zh' ? '\u5728\u6b64\u5904\u76f4\u63a5\u7ba1\u7406\u4f60\u7684 Prakasa \u5b9e\u4f8b\u3002\u804a\u5929\u3001\u914d\u7f6e\u9891\u9053\u3001\u7ba1\u7406\u4ee3\u7406\u7b49\u3002' : 'Manage your Prakasa instance directly from here. Chat, configure channels, manage agents, and more.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-[#f8f9fb] border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500 hover:border-slate-200 transition-all flex items-center gap-1.5">
                  <ExternalLink size={12} /> {lang === 'zh' ? '\u5c55\u5f00' : 'Expand'}
                </button>
                <button className="px-3 py-1.5 bg-[#f8f9fb] border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500 hover:border-slate-200 transition-all flex items-center gap-1.5">
                  <ExternalLink size={12} /> {lang === 'zh' ? '\u65b0\u6807\u7b7e\u6253\u5f00' : 'Open in New Tab'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-[#0b0e14] rounded-xl p-0 font-mono text-[12px] text-slate-300 min-h-[320px] shadow-2xl overflow-hidden border border-white/5">
                {/* Terminal Header */}
                <div className="bg-white/5 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">zsh — 80x24</div>
                  <div className="w-10"></div>
                </div>

                {/* Terminal Content */}
                <div className="p-4 space-y-1.5 overflow-y-auto max-h-[260px] custom-scrollbar">
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">oc@openclaw</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-blue-400 font-bold">~</span>
                    <span className="text-slate-400">$</span>
                    <span className="animate-pulse">_</span>
                  </div>
                  <div className="text-slate-500 text-[10px] pb-2">Last login: {new Date().toLocaleTimeString()} on ttys001</div>
                  <div className="flex gap-2 text-emerald-400/90 italic opacity-80">
                    <span>[SYS]</span>
                    <span>Initializing Prakasa Gateway v4.6.0-stable...</span>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <span className="text-blue-400 font-bold">●</span>
                    <span>Container ID: <span className="text-amber-400/90 text-[11px]">oc-a3f19c52-8d1</span></span>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <span className="text-blue-400 font-bold">●</span>
                    <span>Status: <span className="text-emerald-400/90 text-[11px]">READY</span></span>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <span className="text-blue-400 font-bold">●</span>
                    <span>Port Forwarding: <span className="text-slate-200">18790 → 8080</span></span>
                  </div>
                  <div className="pt-3 flex gap-2 text-emerald-400/90">
                    <span className="shrink-0">➜</span>
                    <span><span className="font-bold">SUCCESS:</span> API Gateway instance is now reachable.</span>
                  </div>
                  <div className="flex gap-2 text-slate-500 pl-5">
                    <span>Listening on: <span className="underline decoration-slate-700">https://clawify-backend.up.railway.app/...</span></span>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <span className="text-emerald-400 font-bold">oc@openclaw</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-blue-400 font-bold">~</span>
                    <span className="text-slate-400">$</span>
                    <span className="w-2 h-4 bg-slate-400 animate-[pulse_1s_infinite]"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2.5">
              <FileText size={16} className="text-slate-500" />
              <h4 className="text-[14px] font-semibold text-slate-800">
                {lang === 'zh' ? '\u5b9e\u4f8b\u4fe1\u606f' : 'Instance Info'}
              </h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                {[
                  { label: lang === 'zh' ? 'AI \u63d0\u4f9b\u5546' : 'AI Provider', value: instance.provider },
                  { label: lang === 'zh' ? '\u6a21\u578b' : 'Model', value: instance.model },
                  { label: lang === 'zh' ? 'VM \u89c4\u683c' : 'VM Size', value: instance.vmSize },
                  { label: lang === 'zh' ? '\u533a\u57df' : 'Region', value: instance.region },
                  { label: lang === 'zh' ? '\u63d2\u4ef6' : 'Plugins', value: instance.plugins.join(', ') },
                  { label: lang === 'zh' ? '\u521b\u5efa\u65f6\u95f4' : 'Created', value: instance.created },
                  { label: lang === 'zh' ? '\u5bb9\u5668 ID' : 'Container', value: instance.container },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">{item.label}</p>
                    <p className="text-[13px] font-semibold text-slate-800 font-mono">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Connection Tab */}
        {activeTab === 'connection' && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <div className="flex items-center gap-2.5 mb-1">
                <Wifi size={16} className="text-slate-500" />
                <h4 className="text-[14px] font-semibold text-slate-800">
                  {lang === 'zh' ? '\u8fde\u63a5\u8be6\u60c5' : 'Connection Details'}
                </h4>
              </div>
              <p className="text-[11px] font-medium text-slate-400 pl-[26px]">
                {lang === 'zh' ? '\u901a\u8fc7\u5b89\u5168\u4ee3\u7406\u8bbf\u95ee\u4f60\u7684 Prakasa \u5b9e\u4f8b\u3002\u539f\u59cb VM IP \u4e0d\u4f1a\u66b4\u9732\u3002' : 'Access your Prakasa instance through the secure proxy below. The raw VM IP is never exposed.'}
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  {lang === 'zh' ? '\u63a7\u5236\u9762\u677f (\u4ee3\u7406)' : 'Control UI (Proxied)'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#f8f9fb] border border-slate-100 rounded-lg px-4 py-2.5 font-mono text-[12px] text-slate-600 truncate">
                    {instance.proxyUrl}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(instance.proxyUrl); alert('Copied!'); }}
                    className="w-9 h-9 bg-[#f8f9fb] border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all shrink-0"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  {lang === 'zh' ? '\u7f51\u5173\u4ee4\u724c' : 'Gateway Token'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#f8f9fb] border border-slate-100 rounded-lg px-4 py-2.5 font-mono text-[12px] text-slate-600 truncate">
                    {showToken ? instance.gatewayToken : '\u2022'.repeat(32)}
                  </div>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="w-9 h-9 bg-[#f8f9fb] border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all shrink-0"
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(instance.gatewayToken); alert('Copied!'); }}
                    className="w-9 h-9 bg-[#f8f9fb] border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all shrink-0"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                  {lang === 'zh' ? '\u7528\u4e8e Prakasa \u7f51\u5173\u8ba4\u8bc1\u3002\u4ee3\u7406\u81ea\u52a8\u6ce8\u5165\u6b64\u4ee4\u724c\u3002' : 'Used for authenticating with the Prakasa gateway. The proxy injects this automatically.'}
                </p>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  {lang === 'zh' ? '\u7aef\u53e3' : 'Port'}
                </label>
                <div className="bg-[#f8f9fb] border border-slate-100 rounded-lg px-4 py-2.5 font-mono text-[12px] text-slate-600 w-fit">
                  {instance.port}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu size={16} className="text-slate-500" />
                <div>
                  <h4 className="text-[14px] font-semibold text-slate-800">
                    {lang === 'zh' ? '\u6a21\u578b\u7ba1\u7406' : 'Model Management'}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400">
                    {lang === 'zh' ? '\u67e5\u770b\u5e76\u5207\u6362\u5f53\u524d\u5b9e\u4f8b\u8fd0\u884c\u7684 AI \u6a21\u578b\u3002' : 'View and switch the AI model running on this instance.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-blue-600">{lang === 'zh' ? '智能路由' : 'Smart Routing'}</span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Active Model */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-3 uppercase tracking-wider">
                  {lang === 'zh' ? '\u5f53\u524d\u6b63\u5728\u4f7f\u7528' : 'Current Active Model'}
                </label>
                <div className={`flex items-center justify-between p-4 rounded-xl group transition-all duration-500 border ${isSwitching ? 'bg-blue-50/50 border-blue-100 animate-pulse' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-500 ${isSwitching ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100/50 text-emerald-600'}`}>
                      {isSwitching ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                    </div>
                    <div>
                      <h5 className="text-[15px] font-bold text-slate-800 transition-opacity duration-300">
                        {isSwitching ? (lang === 'zh' ? '正在切换模型...' : 'Switching model...') : currentModel.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${isSwitching ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {isSwitching ? 'SYNCING' : 'STABLE'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {currentModel.provider} · {isSwitching ? (lang === 'zh' ? '正在优化连接' : 'Optimizing connection') : 'Enterprise Gateway'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[12px] font-bold transition-colors ${isSwitching ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {isSwitching ? (lang === 'zh' ? '加载中' : 'Loading') : 'Active Now'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isSwitching ? '---' : 'Uptime: 2h 45m'}
                    </p>
                  </div>
                </div>
              </div>


              {/* Available Models */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {lang === 'zh' ? '\u53ef\u7528\u6a21\u578b\u5217\u8868' : 'Available Models'}
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    {lang === 'zh' ? '4 \u4e2a\u53ef\u7528' : '4 Available'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'GPT-4o', provider: 'OpenAI', status: 'online', type: 'Flagship' },
                    { name: 'Claude 4.5 Sonnet', provider: 'Anthropic', status: 'online', type: 'Expert' },
                    { name: 'Gemini 3.0 Flash', provider: 'Google', status: 'online', type: 'Fast' },
                    { name: 'DeepSeek R1', provider: 'DeepSeek', status: 'busy', type: 'Thinking' },
                  ].map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSwitchModel(m)}
                      disabled={isSwitching}
                      className={`flex items-center justify-between p-3.5 border rounded-xl hover:shadow-sm transition-all text-left ${currentModel.name === m.name ? 'bg-white border-blue-400 ring-1 ring-blue-400/20' : 'bg-[#f8f9fb] border-slate-100 hover:bg-white hover:border-blue-200'} ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModel.name === m.name ? 'bg-blue-50 text-blue-500' : m.status === 'busy' ? 'bg-amber-50 text-amber-500' : 'bg-white text-slate-600 border border-slate-100'}`}>
                          <Sparkles size={14} />
                        </div>
                        <div>
                          <p className={`text-[13px] font-bold transition-colors ${currentModel.name === m.name ? 'text-blue-600' : 'text-slate-800'}`}>{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{m.provider} · {m.type}</p>
                        </div>
                      </div>
                      {currentModel.name === m.name ? (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'busy' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Model Button */}
              <button
                onClick={() => setIsEditingKey(true)}
                className="w-full py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all font-medium text-sm group"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                {lang === 'zh' ? '添加并配置自定义模型' : 'Add & Configure Custom Model'}
              </button>

              {/* Configuration Modal */}
              {isEditingKey && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                  <div className="absolute inset-0 bg-[#08090e]/60 backdrop-blur-sm" onClick={() => setIsEditingKey(false)} />
                  <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800">
                        {lang === 'zh' ? '自定义模型配置' : 'Custom Model Configuration'}
                      </h3>
                      <button onClick={() => setIsEditingKey(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Model Select */}
                      <div className="relative">
                        <select className="w-full bg-[#f8f9fb] border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                          <option>{lang === 'zh' ? '自定义模型' : 'Custom Model'}</option>
                          <option>GPT-4o</option>
                          <option>Claude 3.5 Sonnet</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Mode Toggle */}
                      <div className="flex p-1 bg-[#f8f9fb] rounded-xl border border-slate-100">
                        <button
                          onClick={() => setConfigMode('json')}
                          className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${configMode === 'json' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          JSON {lang === 'zh' ? '输入' : 'Input'}
                        </button>
                        <button
                          onClick={() => setConfigMode('form')}
                          className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${configMode === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {lang === 'zh' ? '表单输入' : 'Form Input'}
                        </button>
                      </div>

                      {/* Input Content */}
                      <div className="space-y-4">
                        {configMode === 'json' ? (
                          <textarea
                            className="w-full h-48 bg-[#f8f9fb] border border-slate-100 rounded-xl p-4 font-mono text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                            placeholder={lang === 'zh' ? '请输入自定义模型配置JSON' : 'Enter custom model configuration JSON'}
                          />
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { label: 'provider', placeholder: lang === 'zh' ? '请输入自定义模型 provider' : 'Enter model provider' },
                              { label: 'base_url', placeholder: lang === 'zh' ? '请输入自定义模型 base_url' : 'Enter model base_url' },
                              { label: 'api', placeholder: lang === 'zh' ? '请输入自定义模型 api' : 'Enter model api' },
                              { label: 'api_key', placeholder: lang === 'zh' ? '请输入自定义模型 api_key' : 'Enter model api_key' },
                              { label: 'model.id', placeholder: lang === 'zh' ? '请输入自定义模型 model.id' : 'Enter model.id' },
                              { label: 'model.name', placeholder: lang === 'zh' ? '请输入自定义模型 model.name' : 'Enter model.name' },
                            ].map((field, idx) => (
                              <input
                                key={idx}
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                placeholder={field.placeholder}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => setIsEditingKey(false)}
                        className="w-full py-4 bg-[#0c0f16] text-white rounded-xl font-bold text-sm hover:bg-[#1a202c] transition-all shadow-lg shadow-black/5"
                      >
                        {lang === 'zh' ? '添加并应用' : 'Add & Apply'}
                      </button>

                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <span>{lang === 'zh' ? '自定义模型配置请查看' : 'For more info, see'}</span>
                          <a href="#" className="text-blue-600 hover:underline flex items-center gap-0.5">
                            {lang === 'zh' ? '详细教程' : 'Detailed Instructions'} <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#08090e]/80 backdrop-blur-xl" onClick={() => !isLoggingIn && setShowLoginModal(false)} />
          <div className="relative w-full max-w-md bg-[#0c0f16] border border-white/[0.08] rounded-3xl p-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="text-center space-y-3 mb-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#08090e] mx-auto mb-6 shadow-xl shadow-white/5">
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{t.login_title}</h3>
              <p className="text-slate-500 font-medium text-sm">{t.login_subtitle}</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full flex items-center justify-center gap-4 py-4 rounded-xl font-bold transition-all relative overflow-hidden ${isLoggingIn
                ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                : 'bg-white text-[#08090e] hover:bg-white/90 active:scale-[0.98]'
                }`}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  <span>{t.login_logging_in}</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t.login_google}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] font-medium text-slate-600">{t.login_or}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Twitter */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold transition-all bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t.login_twitter}
            </button>

            {/* Wallet */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold transition-all bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              {t.login_wallet}
            </button>

            <p className="mt-6 text-center text-slate-600 text-[11px] leading-relaxed max-w-[240px] mx-auto">
              {t.login_terms}
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#fafafa]">
        {view === 'home' ? <LandingPage /> : <DashboardLayout />}
      </div>
    </>
  );
}

// --- Mount App ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PrakasaAPIApp />);
}
