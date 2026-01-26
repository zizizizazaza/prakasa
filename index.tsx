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
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type View = 'home' | 'dashboard' | 'tokens' | 'billing' | 'models' | 'logs' | 'settings' | 'playground';

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
  { id: 'gemini-2.0-flash', provider: 'Google', name: 'Gemini 2.0 Flash', officialInput: 0.1, officialOutput: 0.4, multiplier: 1.0, status: 'online', description: 'model_desc_gpt', tags: ['快闪', '多模态'], category: 'Google' },
  { id: 'google/gemini-2.0-flash-exp:free', provider: 'Google', name: 'Gemini 2.0 Flash Exp', officialInput: 0, officialOutput: 0, multiplier: 0, status: 'online', description: 'model_desc_gpt', tags: ['免费', '实验'], category: 'Google' },
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
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [view, setView] = useState<View>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      pricing_subheadline: "按量付费或选择月度订阅，享受更高折扣与专属通道",
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
      paygo_c2_price: "$ 11.00",
      paygo_c2_f1: "包含 $100.00 额度",
      paygo_c2_f2: "按量计费，余额永久有效",
      paygo_c2_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      paygo_c2_f4: "完美兼容 Cursor / VSCode 插件",
      paygo_c2_f5: "",
      paygo_c3_label: "标准包",
      paygo_c3_price: "$ 62.00",
      paygo_c3_f1: "包含 $500.00 额度",
      paygo_c3_f2: "按量计费，余额永久有效",
      paygo_c3_f3: "仅支持 Claude 4.5 & Codex 5.1 & Gemini 3系列",
      paygo_c3_f4: "完美兼容 Cursor / Windsurf / Codex",
      paygo_c3_f5: "",
      paygo_c4_label: "海量包",
      paygo_c4_price: "$ 125.00",
      paygo_c4_f1: "包含 $1000.00 额度",
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
      nav_dash_overview: "总览面板",
      nav_dash_tokens: "令牌管理",
      nav_dash_plans: "订阅套餐",
      nav_dash_billing: "余额充值",
      nav_dash_models: "模型列表",
      nav_dash_playground: "在线调试",
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
      pricing_subheadline: "Pay-as-you-go or monthly subscription for higher discounts and dedicated lanes.",
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
      paygo_c2_price: "$ 11.00",
      paygo_c2_f1: "Includes $100.00 credit",
      paygo_c2_f2: "Pay-as-you-go, never expires",
      paygo_c2_f3: "Supports Claude 4.5 / Codex / Gemini 3 series",
      paygo_c2_f4: "Cursor / VSCode plugin compliant",
      paygo_c2_f5: "",
      paygo_c3_label: "Standard Pack",
      paygo_c3_price: "$ 62.00",
      paygo_c3_f1: "Includes $500.00 credit",
      paygo_c3_f2: "Pay-as-you-go, never expires",
      paygo_c3_f3: "Supports Claude 4.5 / Codex / Gemini 3 series",
      paygo_c3_f4: "Cursor / Windsurf / Codex friendly",
      paygo_c3_f5: "",
      paygo_c4_label: "Bulk Pack",
      paygo_c4_price: "$ 125.00",
      paygo_c4_f1: "Includes $1000.00 credit",
      paygo_c4_f2: "Pay-as-you-go, never expires",
      paygo_c4_f3: "Supports Claude 4.5 / Codex / Gemini 3 series",
      paygo_c4_f4: "Enterprise High Speed Lane",
      paygo_c4_f5: "",
      pricing_cta_recharge: "Buy Now",
      nav_dash_overview: "Dashboard ",
      nav_dash_tokens: "Tokens",
      nav_dash_plans: "Subscription Plans",
      nav_dash_billing: "Top-up",
      nav_dash_models: "Models",
      nav_dash_playground: "Playground",
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
    }
  }[lang];

  const totalEffectiveBalance = useMemo(() => balance + subscriptionQuota, [balance, subscriptionQuota]);

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

  // --- Landing Page ---
  const LandingPage = () => {
    const [pricingTab, setPricingTab] = useState<'paygo' | 'sub'>('paygo');

    return (
      <div className="bg-white">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism h-20 px-10 flex items-center justify-between border-b border-slate-100/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
              <Zap size={22} fill="white" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter italic">Prakasa API</span>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">{t.nav_home}</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">{t.nav_features}</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">{t.nav_pricing}</a>
            <a href="#docs" className="hover:text-blue-600 transition-colors">{t.nav_docs}</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="p-2 px-3 text-slate-500 hover:text-blue-600 transition-all flex items-center gap-2 font-black text-[12px] bg-slate-50 rounded-xl border border-slate-200/50 hover:border-blue-200 hover:bg-blue-50/50"
            >
              <Globe size={16} />
              {lang === 'zh' ? 'EN' : 'ZH'}
            </button>
            <button
              onClick={() => { setIsLoggedIn(true); setView('dashboard'); }}
              className="px-6 py-2.5 bg-[#2563EB] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              <LayoutDashboard size={18} /> {t.nav_dashboard}
            </button>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-16 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_#f0f7ff_0%,_transparent_50%)]">
          <div className="max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-10 z-10">
              <div className="space-y-6">
                <h2 className="text-xl font-black text-blue-600">Prakasa API Platform</h2>
                <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                  {t.hero_headline}<br />
                  <span className="text-blue-600">{t.hero_subline}</span>
                </h1>
              </div>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-xl">
                {t.hero_desc}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-6">
                <button
                  onClick={() => { setIsLoggedIn(true); setView('dashboard'); }}
                  className="group relative flex-1 sm:flex-initial flex flex-col items-center justify-center px-10 py-5 bg-[#2563EB] text-white rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-600 hover:scale-[1.02] transition-all"
                >
                  <span className="text-xl font-black mb-1">{t.hero_cta_start}</span>
                  <span className="text-[11px] font-bold opacity-70">{t.hero_cta_bonus}</span>
                </button>
                <a
                  href="#pricing"
                  className="flex-1 sm:flex-initial flex items-center justify-center px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl text-lg font-black hover:bg-slate-50 hover:border-slate-200 transition-all text-center"
                >
                  {t.hero_cta_pricing}
                </a>
              </div>

              {/* Trust Bar */}
              <div className="pt-10 flex flex-wrap items-center gap-y-4 gap-x-8 text-slate-400 font-bold text-sm border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Zap size={14} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black leading-none mb-1">12,000+</p>
                    <p className="text-[11px] text-slate-400 font-bold">{t.trust_devs_unit}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                <div className="flex flex-col">
                  <p className="text-slate-900 font-black leading-none mb-1">{t.trust_stat_power}</p>
                  <p className="text-[11px] text-slate-400 font-bold">{t.trust_tokens_unit}</p>
                </div>
                <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                <div className="flex flex-col">
                  <p className="text-slate-900 font-black leading-none mb-1">&lt; 200ms</p>
                  <p className="text-[11px] text-slate-400 font-bold">{t.trust_latency_unit}</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative flex justify-center">
              <div className="relative w-full max-w-[540px] aspect-[4/3]">
                {/* Background Glows */}
                <div className="absolute -inset-10 bg-blue-400/20 blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-[3rem] rotate-3 blur-2xl"></div>

                {/* Main "Glass" Panel */}
                <div className="relative z-10 w-full h-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden group">
                  {/* Dashboard Header Bar */}
                  <div className="h-10 bg-slate-800/50 border-b border-slate-700/50 flex items-center px-6 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    <div className="ml-4 h-4 w-32 bg-slate-700/50 rounded-full"></div>
                  </div>

                  {/* Content Area - Geometric Abstract Visualization */}
                  <div className="relative w-full h-full bg-[#0B0F1A] overflow-hidden">
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,#2563eb_0%,transparent_50%)] blur-[60px]"></div>
                      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,#9333ea_0%,transparent_50%)] blur-[60px]"></div>
                    </div>

                    {/* Floating Lines/Connectors */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#9333ea" />
                        </linearGradient>
                      </defs>
                      <path d="M0 100 Q 150 50 300 150 T 600 100" stroke="url(#line-grad)" strokeWidth="2" fill="none" />
                      <path d="M0 200 Q 200 250 400 100 T 600 200" stroke="url(#line-grad)" strokeWidth="2" fill="none" />
                    </svg>

                    {/* Model Scrolling Stream */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="relative w-full h-full overflow-hidden mask-fade-edges">
                        <div className="flex flex-col gap-4 animate-vertical-scroll p-4">
                          {[
                            { name: 'GPT-4o', color: 'from-emerald-400 to-cyan-400' },
                            { name: 'Claude 4.5', color: 'from-orange-400 to-amber-400' },
                            { name: 'Gemini 1.5 Pro', color: 'from-blue-400 to-indigo-400' },
                            { name: 'DeepSeek V3', color: 'from-slate-400 to-slate-600' },
                            { name: 'Llama 3.1 405B', color: 'from-purple-400 to-pink-400' },
                            { name: 'Codex 5.1', color: 'from-blue-500 to-teal-400' },
                            { name: 'Stable Diffusion 3', color: 'from-rose-400 to-pink-400' },
                            { name: 'GPT-4o', color: 'from-emerald-400 to-cyan-400' },
                            { name: 'Claude 4.5', color: 'from-orange-400 to-amber-400' },
                            { name: 'Gemini 1.5 Pro', color: 'from-blue-400 to-indigo-400' },
                            { name: 'DeepSeek V3', color: 'from-slate-400 to-slate-600' },
                            { name: 'Llama 3.1 405B', color: 'from-purple-400 to-pink-400' },
                            { name: 'Codex 5.1', color: 'from-blue-500 to-teal-400' },
                            { name: 'Stable Diffusion 3', color: 'from-rose-400 to-pink-400' },
                          ].map((model, i) => (
                            <div
                              key={i}
                              className={`h-20 shrink-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 flex items-center gap-6 transition-all duration-500 hover:bg-white/10 group/item ${i % 7 === 1 ? 'model-highlight scale-110 bg-white/10 border-blue-500/50' : ''}`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center shadow-lg`}>
                                <Sparkles size={20} className="text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-black text-lg tracking-tight group-hover/item:text-blue-400 transition-colors">{model.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Ready to Serve</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gradient Overlays for smooth fading */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A] opacity-80"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Key Badges - Redesigned */}
                <div className="absolute -top-6 -right-10 z-20 p-5 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 border border-slate-100">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Supported Models</p>
                    <p className="font-black text-slate-900 text-3xl">100+</p>
                  </div>
                </div>

                <div className="absolute -bottom-10 -left-12 z-20 p-5 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 border border-slate-100">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">Security</p>
                    <p className="font-black text-slate-900 text-lg">Official Enterprise Key</p>
                  </div>
                </div>

                {/* Code Snippet Float */}
                <div className="absolute top-1/2 -right-16 -translate-y-1/2 z-20 hidden xl:block p-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 font-mono text-[10px] space-y-2 w-48 scale-110">
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                  </div>
                  <p className="text-blue-400">const <span className="text-white">api</span> = <span className="text-emerald-400">'novahub'</span>;</p>
                  <p className="text-slate-500">{"// Connecting..."}</p>
                  <p className="text-purple-400">await <span className="text-white">api.deploy()</span>;</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Core Advantages */}
        <section id="features" className="py-24 bg-white relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-50 rounded-full blur-3xl opacity-50 animate-float-slow"></div>

          <div className="max-w-7xl mx-auto px-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  id: 'A',
                  num: "01",
                  title: t.adv1_title,
                  desc: t.adv1_desc,
                  color: "blue",
                  icon: TrendingUp
                },
                {
                  id: 'B',
                  num: "02",
                  title: t.adv2_title,
                  desc: t.adv2_desc,
                  color: "indigo",
                  icon: ShieldCheck
                },
                {
                  id: 'C',
                  num: "03",
                  title: t.adv3_title,
                  desc: t.adv3_desc,
                  color: "emerald",
                  icon: Code
                }
              ].map((adv, i) => (
                <Card key={adv.id} className="p-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500 border-none bg-white relative group overflow-hidden">
                  {/* Hover Accent */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-${adv.color}-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>

                  {/* Background Number */}
                  <div className="absolute top-8 right-8 text-8xl font-black text-slate-100/50 select-none group-hover:text-slate-200/50 transition-colors duration-500">
                    {adv.num}
                  </div>

                  <div className={`w-16 h-16 rounded-2xl bg-${adv.color}-50 text-${adv.color}-600 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-${adv.color}-100`}>
                    <adv.icon size={32} />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-4 relative z-10">{adv.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed relative z-10">
                    {adv.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Code Showcase Section */}
        <section id="docs" className="py-24 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-10 flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-10">
              <div className="space-y-4 border-l-8 border-indigo-600 pl-8">
                <h2 className="text-5xl font-black text-slate-800 leading-tight">
                  {t.showcase_headline}<br />{t.showcase_headline_sub}
                </h2>
              </div>
              <p className="text-lg font-bold text-slate-500 leading-relaxed">
                {t.showcase_desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'f1', text: t.showcase_f1 },
                  { key: 'f2', text: t.showcase_f2 },
                  { key: 'f3', text: t.showcase_f3 },
                  { key: 'f4', text: t.showcase_f4 }
                ].map((f) => (
                  <div key={f.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><CheckCircle2 size={18} /></div>
                    <span className="font-bold text-slate-700">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-[#1e293b] rounded-[2rem] shadow-2xl p-8 border border-slate-700/50 relative">
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-500 ml-4 font-mono">developer@novahub:~/api-demo</span>
                </div>
                <pre className="text-sm md:text-base font-mono leading-relaxed overflow-x-auto text-slate-300 no-scrollbar">
                  <code>
                    <span className="text-blue-400">$ curl</span> -X POST https://api.novahub.com/v1/chat/completions \<br />
                    -H <span className="text-emerald-400">"Content-Type: application/json"</span> \<br />
                    -H <span className="text-emerald-400">"Authorization: Bearer sk-your-api-key"</span> \<br />
                    -d <span className="text-slate-100">'{'{'}</span><br />
                    <span className="text-fuchsia-400">"model"</span>: <span className="text-emerald-400">"claude-3-5-sonnet-20241022"</span>,<br />
                    <span className="text-fuchsia-400">"messages"</span>: [ {'{'} "role": "user", "content": "Hello!" {'}'} ]<br />
                    <span className="text-slate-100">{'}'}'</span><br /><br />
                    <span className="text-blue-400">HTTP/1.1 200 OK</span><br />
                    <span className="text-slate-500">Content-Type: application/json</span><br /><br />
                    <span className="text-slate-100"> {'{'} </span><br />
                    <span className="text-fuchsia-400">"id"</span>: <span className="text-emerald-400">"msg_01XYZ"</span>,<br />
                    <span className="text-fuchsia-400">"model"</span>: <span className="text-emerald-400">"claude-3-5-sonnet"</span>,<br />
                    <span className="text-fuchsia-400">"content"</span>: <span className="text-emerald-400">"Hello! How can I help you today?"</span><br />
                    <span className="text-slate-100"> {'}'} </span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section >

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-10 text-center">
            <div className="mb-12 text-center">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">{t.pricing_headline}</h2>
              <p className="text-slate-500 font-bold">{t.pricing_subheadline}</p>
            </div>

            {/* Pricing Tabs */}
            <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl mb-16 shadow-inner border border-slate-200">
              <button
                onClick={() => setPricingTab('paygo')}
                className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${pricingTab === 'paygo' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.pricing_tab_paygo}
              </button>
              <button
                onClick={() => setPricingTab('sub')}
                className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${pricingTab === 'sub' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.pricing_tab_sub}
              </button>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 ${pricingTab === 'paygo' ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-8 justify-center max-w-7xl mx-auto`}>
              {pricingTab === 'paygo' ? (
                <>
                  {/* PAYGO Card 1: Flexible */}
                  <Card className="p-8 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100 flex flex-col transition-all hover:-translate-y-2 border shadow-sm">
                    <div className="mb-6 text-left">
                      <h3 className="text-xl font-black mb-1 text-indigo-900 flex items-center gap-2 italic leading-tight">{t.paygo_c1_label}</h3>
                      <p className="text-indigo-400 font-bold text-[10px]">{t.pricing_paygo_label}</p>
                    </div>
                    <div className="mb-8 flex items-baseline gap-1 text-left">
                      <span className="text-4xl font-black text-indigo-950 whitespace-nowrap">{t.paygo_c1_price}</span>
                      <span className="text-indigo-400 font-bold text-[10px]">{t.pricing_paygo_start}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-left">
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span className="text-indigo-950 font-black">{t.paygo_c1_f1}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c1_f2}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span className="text-indigo-700 font-black bg-indigo-50 px-1.5 py-0.5 rounded-md">{t.paygo_c1_f3}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c1_f4}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c1_f5}</span>
                      </li>
                    </ul>
                    <button className="w-full py-3.5 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-black text-sm hover:border-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
                      {t.pricing_cta_recharge}
                    </button>
                  </Card>

                  {/* PAYGO Card 2: Light */}
                  <Card className="p-8 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border shadow-sm">
                    <div className="mb-6 text-left">
                      <h3 className="text-xl font-black mb-1 text-slate-800 flex items-center gap-2 italic leading-tight">{t.paygo_c2_label}</h3>
                      <p className="text-slate-400 font-bold text-[10px]">{t.pricing_paygo_label}</p>
                    </div>
                    <div className="mb-8 flex items-baseline gap-1 text-left">
                      <span className="text-4xl font-black text-slate-900 whitespace-nowrap">{t.paygo_c2_price}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-left">
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black">{t.paygo_c2_f1}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c2_f2}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c2_f3}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c2_f4}</span>
                      </li>
                    </ul>
                    <button className="w-full py-3.5 bg-white text-slate-500 border-2 border-slate-100 rounded-xl font-black text-sm hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95">
                      {t.pricing_cta_recharge}
                    </button>
                  </Card>

                  {/* PAYGO Card 3: Standard */}
                  <Card className="p-8 bg-white border-blue-600 relative flex flex-col shadow-xl transition-all hover:-translate-y-2 border-2">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg whitespace-nowrap z-20">
                      {t.badge_recommended}
                    </div>
                    <div className="mb-6 text-left">
                      <h3 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2 italic leading-tight">{t.paygo_c3_label}</h3>
                      <p className="text-slate-400 font-bold text-[10px]">{t.pricing_paygo_label}</p>
                    </div>
                    <div className="mb-8 flex items-baseline gap-1 text-left">
                      <span className="text-4xl font-black text-slate-900 whitespace-nowrap">{t.paygo_c3_price}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-left">
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black">{t.paygo_c3_f1}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c3_f2}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c3_f3}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c3_f4}</span>
                      </li>
                    </ul>
                    <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                      {t.pricing_cta_recharge}
                    </button>
                  </Card>

                  {/* PAYGO Card 4: Bulk */}
                  <Card className="p-8 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border shadow-sm">
                    <div className="mb-6 text-left">
                      <h3 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2 italic font-sans tracking-tight leading-tight">{t.paygo_c4_label}</h3>
                      <p className="text-slate-400 font-bold text-[10px] text-left">{t.pricing_paygo_label}</p>
                    </div>
                    <div className="mb-8 flex items-baseline gap-1 text-left">
                      <span className="text-4xl font-black text-slate-900 whitespace-nowrap">{t.paygo_c4_price}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-left">
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black">{t.paygo_c4_f1}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c4_f2}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c4_f3}</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{t.paygo_c4_f4}</span>
                      </li>
                    </ul>
                    <button className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all shadow-lg active:scale-95">
                      {t.pricing_cta_recharge}
                    </button>
                  </Card>
                </>
              ) : (
                <>
                  {/* Subscription Card 1: Pro */}
                  <Card className="p-10 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border">
                    <div className="mb-8 text-left">
                      <h3 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2 italic">{t.sub_pro_label}</h3>
                      <p className="text-slate-400 font-bold text-[10px]">{t.sub_pro_target}</p>
                    </div>
                    <div className="mb-10 flex items-baseline gap-2 text-left">
                      <span className="text-5xl font-black text-slate-900">{t.sub_pro_price}</span>
                      <span className="text-slate-400 font-bold text-sm">{t.sub_pro_unit}</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1 text-left">
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black">{t.sub_pro_f1}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_pro_f2}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_pro_f3}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_pro_f4}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_pro_f5}</span>
                      </li>
                    </ul>
                    <button className="w-full py-4 bg-slate-50 text-slate-600 border-2 border-slate-100 rounded-2xl font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm">
                      {t.sub_cta_subscribe}
                    </button>
                  </Card>

                  {/* Subscription Card 2: Max */}
                  <Card className="p-10 bg-white border-blue-600 relative flex flex-col shadow-2xl transition-all hover:-translate-y-2 border-2">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg whitespace-nowrap z-20">
                      {t.badge_recommended}
                    </div>
                    <div className="mb-8 text-left">
                      <h3 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2 italic">{t.sub_max_label}</h3>
                      <p className="text-slate-400 font-bold text-[10px]">{t.sub_max_target}</p>
                    </div>
                    <div className="mb-10 flex items-baseline gap-2 text-left">
                      <span className="text-5xl font-black text-slate-900">{t.sub_max_price}</span>
                      <span className="text-slate-400 font-bold text-sm">{t.sub_max_unit}</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1 text-left">
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black">{t.sub_max_f1}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_max_f2}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_max_f3}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-blue-600 font-black tracking-tight">{t.sub_max_f4}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_max_f5}</span>
                      </li>
                    </ul>
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                      {t.sub_cta_subscribe}
                    </button>
                  </Card>

                  {/* Subscription Plan 3: Ultra */}
                  <Card className="p-10 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border">
                    <div className="mb-8 text-left">
                      <h3 className="text-2xl font-black mb-1 flex items-center gap-2 italic text-slate-900 font-sans tracking-tight">{t.sub_team_label}</h3>
                      <p className="text-slate-400 font-bold text-[10px] text-left">{t.sub_team_target}</p>
                    </div>
                    <div className="mb-10 flex items-baseline gap-2 text-left">
                      <span className="text-5xl font-black text-slate-900">{t.sub_team_price}</span>
                      <span className="text-slate-400 font-bold text-sm">{t.sub_team_unit}</span>
                    </div>
                    <ul className="space-y-4 mb-10 flex-1 text-left">
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black">{t.sub_team_f1}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_team_f2}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{t.sub_team_f3}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-blue-600 font-black">{t.sub_team_f4}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm font-bold">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-900 font-black italic tracking-tight">{t.sub_team_f5}</span>
                      </li>
                    </ul>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95">
                      {t.sub_cta_team}
                    </button>
                  </Card>
                </>
              )}
            </div>

            <div className="mt-14 text-center">
              <button
                onClick={() => { setIsLoggedIn(true); setView('models'); }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-50 text-blue-600 rounded-xl font-black transition-all hover:bg-blue-600 hover:text-white group shadow-sm active:scale-95"
              >
                {t.pricing_view_all_models}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-14 text-center text-slate-400 font-bold text-sm">
              {t.footer_trust}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-16 px-10 text-slate-400 font-bold text-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white"><Zap size={18} fill="white" /></div>
              <span className="text-xl font-black text-slate-800 tracking-tighter italic">Prakasa API</span>
            </div>
            <p className="text-sm">© 2026 Prakasa API Cloud Platform. All rights reserved.</p>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-blue-600">Privacy</a>
              <a href="#" className="hover:text-blue-600">Terms</a>
              <a href="#" className="hover:text-blue-600">Contact</a>
            </div>
          </div>
        </footer>
      </div >
    );
  };

  const DashboardLayout = () => (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-full shadow-sm shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Zap size={20} fill="white" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter italic">Prakasa API</span>
        </div>
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto mt-4">
          {[
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
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[14px] font-bold transition-all ${view === item.id
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6">
          <Card className="bg-slate-50 p-6 mb-6 rounded-3xl border-none shadow-none">
            <p className="text-[10px] font-black text-slate-400 mb-1">{t.dash_available_quota}</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">${totalEffectiveBalance.toFixed(2)}</p>
          </Card>
          <button
            onClick={() => { setIsLoggedIn(false); setView('home'); }}
            className="w-full flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold"
          >
            <LogOut size={20} /> {t.nav_dash_logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 glass-morphism border-b border-slate-100 flex items-center px-10 shrink-0 sticky top-0 z-20">
          <h2 className="text-xl font-black text-slate-800">
            {view === 'dashboard' ? t.nav_dash_overview :
              view === 'tokens' ? t.nav_dash_tokens :
                view === 'plans' ? t.nav_dash_plans :
                  view === 'billing' ? t.nav_dash_billing :
                    view === 'models' ? t.nav_dash_models :
                      view === 'playground' ? t.nav_dash_playground : view}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          {view === 'dashboard' && <DashboardContent />}
          {view === 'tokens' && <TokensView />}
          {view === 'plans' && <PlansView />}
          {view === 'billing' && <BillingView />}
          {view === 'models' && <ModelsView />}
          {view === 'playground' && <PlaygroundView />}
          {view === 'settings' && <div className="p-20 text-center text-slate-400 font-bold">{t.settings_coming_soon}</div>}
        </div>
      </main>
    </div>
  );

  const DashboardContent = () => (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      <Card className="p-10 bg-gradient-to-br from-blue-700 to-blue-600 border-none relative overflow-hidden text-white shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12"><Zap size={200} fill="white" /></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <h3 className="text-3xl font-black mb-4">{t.dash_welcome}</h3>
            <p className="text-blue-100 text-lg font-medium opacity-90">{t.dash_welcome_sub}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 flex-1 min-w-[240px] relative group overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-black text-blue-200">{t.dash_base_url}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText('https://api.novahub.com/v1'); alert('Copied!'); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg text-white"
                >
                  <Copy size={14} />
                </button>
              </div>
              <code className="text-sm font-bold block truncate pr-8">https://api.novahub.com/v1</code>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 flex-1 min-w-[240px] relative group overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-black text-blue-200">{t.dash_api_key}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText('sk-nova-xxxxxxxxxxxx4k9a'); alert('Copied!'); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg text-white"
                >
                  <Copy size={14} />
                </button>
              </div>
              <code className="text-sm font-bold block truncate pr-8">sk-nova-••••••••4k9a</code>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Module */}
        <Card className="flex flex-col overflow-hidden bg-white border-slate-100 shadow-sm border">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 tracking-tight">{t.dash_balance_title}</span>
              <Info size={14} className="text-slate-400 cursor-help" />
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#ff6a00] text-white text-[10px] font-black px-2 py-1 rounded-full">{t.dash_promo_badge}</span>
              <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
                <CreditCard size={14} /> {t.dash_recharge_now}
              </button>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-slate-700">{t.dash_sub_balance}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{t.dash_sub_balance_desc}</span>
                </div>
                <span className="text-lg font-black text-slate-800 tracking-tight">$ {subscriptionQuota.toFixed(2)}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-slate-700">{t.dash_paygo_balance}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{t.dash_paygo_balance_desc}</span>
                </div>
                <span className="text-lg font-black text-slate-800 tracking-tight">$ {balance.toFixed(2)}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Module */}
        <Card className="flex flex-col overflow-hidden bg-white border-slate-100 shadow-sm border">
          <div className="p-6 border-b border-slate-50">
            <span className="font-black text-slate-800 tracking-tight">{t.dash_subscription_title}</span>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-center gap-8">
            <div className="border-b border-slate-50 pb-8">
              <span className="text-4xl font-black text-[#1e293b] tracking-tighter italic">{t.dash_no_subscription}</span>
            </div>
            <button className="w-full py-4 bg-[#2563EB] text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-600 hover:-translate-y-0.5 transition-all">
              {t.dash_redeem_code}
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: t.dash_stat_calls, value: '1,240', icon: Globe, color: 'blue' },
          { label: t.dash_stat_tokens, value: '8.52M', icon: TrendingUp, color: 'indigo' },
          { label: t.dash_stat_latency, value: '18ms', icon: Clock, color: 'emerald' },
          { label: t.dash_stat_balance, value: `$${totalEffectiveBalance.toFixed(2)}`, icon: CreditCard, color: 'amber' },
        ].map((stat, i) => (
          <Card key={i} className="p-8">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-${stat.color}-600`}>
              <stat.icon size={22} />
            </div>
            <p className="text-slate-400 text-[10px] font-black mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const TokensView = () => (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-slate-800">{t.dash_token_manage}</h3>
        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100">
          <Plus size={24} /> {t.dash_create_key}
        </button>
      </div>
      <Card className="overflow-hidden border-none shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[11px] font-black text-slate-400">
              <th className="px-8 py-5">{t.dash_th_name}</th>
              <th className="px-8 py-5">{t.dash_th_status}</th>
              <th className="px-8 py-5">{t.dash_th_quota}</th>
              <th className="px-8 py-5 text-right">{t.dash_th_action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tokens.map(token => (
              <tr key={token.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-800">{token.name === 'mock_token_name' ? t.mock_token_name : token.name}</p>
                  <code className="text-xs text-slate-400">{token.key}</code>
                </td>
                <td className="px-8 py-6"><Badge color="green">{t[`status_${token.status}`] || token.status}</Badge></td>
                <td className="px-8 py-6 font-bold text-slate-700">{token.limit === -1 ? t.dash_limit_infinite : `$${token.limit}`}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-3 text-slate-400 hover:text-blue-600"><Copy size={18} /></button>
                  <button className="p-3 text-slate-400 hover:text-rose-600"><Settings size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="pt-8">
        <h3 className="text-2xl font-black text-slate-800 mb-6">{t.dash_logs_title}</h3>
        <Card className="overflow-hidden border-none shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[11px] font-black text-slate-400">
                <th className="px-8 py-5">{t.dash_time}</th>
                <th className="px-8 py-5">{t.dash_model}</th>
                <th className="px-8 py-5">{t.dash_token_usage}</th>
                <th className="px-8 py-5 text-right">{t.dash_cost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{log.time}</td>
                  <td className="px-8 py-6 font-black text-slate-800">{log.model}</td>
                  <td className="px-8 py-6 font-bold text-slate-600">{log.tokens.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right font-black text-blue-600">${log.cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );

  const PlansView = () => (
    <div className="p-10 space-y-8 max-w-7xl mx-auto">
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <Info size={16} />
        </div>
        <p className="text-xs font-black text-amber-700">
          {lang === 'zh'
            ? '重要提示：所有套餐仅支持 Claude 4.5 & Codex 5.1 & Gemini 3 系列模型调用。'
            : 'Notice: All plans only support Claude 4.5 & Codex 5.1 & Gemini 3 series models.'}
        </p>
      </div>

      {/* Section 1: Pay-as-you-go */}
      <section>
        <div className="mb-4 text-left">
          <h3 className="text-2xl font-black text-slate-800">{t.pricing_tab_paygo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 2: Light Pack */}
          <Card className="p-7 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border shadow-sm">
            <div className="mb-4 text-left">
              <h3 className="text-xl font-black mb-1 text-slate-800 flex items-center gap-2 italic leading-tight">{t.paygo_c2_label}</h3>
              <p className="text-slate-400 font-bold text-[10px]">{t.pricing_paygo_label}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1 text-left">
              <span className="text-4xl font-black text-slate-900 whitespace-nowrap">{t.paygo_c2_price}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1 text-left">
              {[t.paygo_c2_f1, t.paygo_c2_f2, t.paygo_c2_f3, t.paygo_c2_f4].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className={i === 0 ? "text-slate-900 font-black" : "text-slate-600"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-slate-50 text-slate-600 border-2 border-slate-100 rounded-xl font-black text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95">
              {t.pricing_cta_recharge}
            </button>
          </Card>

          {/* Card 3: Standard Pack */}
          <Card className="p-7 bg-white border-blue-600 relative flex flex-col transition-all border-2 shadow-xl hover:-translate-y-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg whitespace-nowrap z-20">
              {t.badge_recommended}
            </div>
            <div className="mb-4 text-left">
              <h3 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2 italic leading-tight">{t.paygo_c3_label}</h3>
              <p className="text-slate-400 font-bold text-[10px] text-left">{t.pricing_paygo_label}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1 text-left">
              <span className="text-4xl font-black text-slate-900 whitespace-nowrap">{t.paygo_c3_price}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1 text-left">
              {[t.paygo_c3_f1, t.paygo_c3_f2, t.paygo_c3_f3, t.paygo_c3_f4].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className={i === 0 ? "text-slate-900 font-black" : "text-slate-600"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              {t.pricing_cta_recharge}
            </button>
          </Card>

          {/* Card 4: Bulk Pack */}
          <Card className="p-7 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border shadow-sm">
            <div className="mb-4 text-left">
              <h3 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2 italic leading-tight">{t.paygo_c4_label}</h3>
              <p className="text-slate-400 font-bold text-[10px] text-left">{t.pricing_paygo_label}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1 text-left">
              <span className="text-4xl font-black text-slate-900 whitespace-nowrap">{t.paygo_c4_price}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1 text-left">
              {[t.paygo_c4_f1, t.paygo_c4_f2, t.paygo_c4_f3, t.paygo_c4_f4].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className={i === 0 ? "text-slate-900 font-black" : "text-slate-600"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all shadow-lg active:scale-95">
              {t.pricing_cta_recharge}
            </button>
          </Card>
        </div>
      </section>

      <hr className="border-slate-50" />

      {/* Section 2: Subscription */}
      <section>
        <div className="mb-4 text-left">
          <h3 className="text-2xl font-black text-slate-800">{t.pricing_tab_sub}</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sub Card 1: Pro */}
          <Card className="p-7 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border">
            <div className="mb-4 text-left">
              <h3 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2 italic">{t.sub_pro_label}</h3>
              <p className="text-slate-400 font-bold text-[10px]">{t.sub_pro_target}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-2 text-left">
              <span className="text-4xl font-black text-slate-900">{t.sub_pro_price}</span>
              <span className="text-slate-400 font-bold text-sm">{t.sub_pro_unit}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1 text-left">
              {[t.sub_pro_f1, t.sub_pro_f2, t.sub_pro_f3, t.sub_pro_f4, t.sub_pro_f5].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className={i === 0 ? "text-slate-900 font-black" : "text-slate-700"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-slate-50 text-slate-600 border-2 border-slate-100 rounded-xl font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm">
              {t.sub_cta_subscribe}
            </button>
          </Card>

          {/* Sub Card 2: Max */}
          <Card className="p-7 bg-white border-blue-600 relative flex flex-col shadow-2xl transition-all hover:-translate-y-2 border-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg whitespace-nowrap z-20">
              {t.badge_recommended}
            </div>
            <div className="mb-4 text-left">
              <h3 className="text-2xl font-black mb-1 text-slate-900 flex items-center gap-2 italic">{t.sub_max_label}</h3>
              <p className="text-slate-400 font-bold text-[10px]">{t.sub_max_target}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-2 text-left">
              <span className="text-4xl font-black text-slate-900">{t.sub_max_price}</span>
              <span className="text-slate-400 font-bold text-sm">{t.sub_max_unit}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1 text-left">
              {[t.sub_max_f1, t.sub_max_f2, t.sub_max_f3, t.sub_max_f4, t.sub_max_f5].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className={i === 0 ? "text-slate-900 font-black" : i === 3 ? "text-blue-600 font-black tracking-tight" : "text-slate-700"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
              {t.sub_cta_subscribe}
            </button>
          </Card>

          {/* Sub Card 3: Ultra */}
          <Card className="p-7 bg-white border-slate-100 flex flex-col transition-all hover:-translate-y-2 border">
            <div className="mb-4 text-left">
              <h3 className="text-2xl font-black mb-1 flex items-center gap-2 italic text-slate-900 font-sans tracking-tight">{t.sub_team_label}</h3>
              <p className="text-slate-400 font-bold text-[10px] text-left">{t.sub_team_target}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-2 text-left">
              <span className="text-4xl font-black text-slate-900">{t.sub_team_price}</span>
              <span className="text-slate-400 font-bold text-sm">{t.sub_team_unit}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1 text-left">
              {[t.sub_team_f1, t.sub_team_f2, t.sub_team_f3, t.sub_team_f4, t.sub_team_f5].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className={i === 0 ? "text-slate-900 font-black" : "text-slate-700"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-black transition-all shadow-xl active:scale-95">
              {t.sub_cta_subscribe}
            </button>
          </Card>
        </div>
      </section>
    </div>
  );

  const BillingView = () => (
    <div className="p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Section: Three Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Online Recharge */}
        <Card className="p-8 bg-white border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              {t.dash_recharge_online_title}
            </h3>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder={rechargeCurrency === 'USD' ? t.dash_recharge_amount_placeholder_usd : t.dash_recharge_amount_placeholder_cny}
                className="w-full pl-6 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1677ff] text-white rounded-xl font-black text-xs hover:opacity-90 transition-all shadow-md">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#1677ff]">
                <span className="text-[10px]">支</span>
              </div>
              {t.dash_recharge_method_alipay}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4caf50] text-white rounded-xl font-black text-xs hover:opacity-90 transition-all shadow-md">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#4caf50]">
                <DollarSign size={10} />
              </div>
              {t.dash_recharge_method_usdt}
            </button>
          </div>
        </Card>

        {/* Card 2: Account Balance */}
        <Card className="p-8 bg-white border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-6">{t.dash_account_balance_title}</h3>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-6xl font-black text-slate-800 tracking-tighter">
              $ {balance.toFixed(2)}
            </span>
          </div>
        </Card>

        {/* Card 3: Top-up Reminder */}
        <Card className="p-8 bg-white border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">{t.dash_recharge_reminder_title}</h3>
          <ul className="space-y-4">
            <li className="text-sm font-bold text-slate-500 leading-relaxed">
              {t.dash_recharge_reminder_1}
            </li>
            <li className="text-sm font-bold text-slate-500 leading-relaxed">
              {t.dash_recharge_reminder_2}
            </li>
          </ul>
        </Card>
      </div>

      {/* Bottom Section: Recharge Records Dashboard */}
      <Card className="bg-white border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">{t.dash_recharge_records_title}</h3>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"><History size={18} /></div>
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"><Layers size={18} /></div>
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"><Settings size={18} /></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-50">
              <tr className="text-[11px] font-black text-slate-400">
                <th className="px-8 py-5">{t.dash_th_recharge_amount}</th>
                <th className="px-8 py-5">{t.dash_th_payment_amount}</th>
                <th className="px-8 py-5">{t.dash_th_payment_method}</th>
                <th className="px-8 py-5">{t.dash_th_order_id}</th>
                <th className="px-8 py-5">{t.dash_th_status}</th>
                <th className="px-8 py-5">{t.dash_th_created_at}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-20">
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:bg-blue-50">
                      <Layers size={40} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-black text-slate-400 tracking-widest">{t.dash_no_data}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
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
      <div className="p-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-800 mb-2">{t.nav_dash_models}</h3>
            <p className="text-slate-500 font-bold text-[10px]">{t.pricing_paygo_label}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={lang === 'zh' ? "模型名称 模糊搜索" : "Search model name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm w-full sm:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap border-2 ${selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                : 'bg-white text-slate-500 border-slate-100 hover:border-blue-100 hover:text-blue-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden border-none shadow-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400">
                  <th className="px-8 py-6">{t.dash_market_th_model}</th>
                  <th className="px-8 py-6">{t.dash_market_th_tags}</th>
                  <th className="px-8 py-6 text-center">{t.dash_market_th_multiplier}</th>
                  <th className="px-8 py-6 text-right">{t.dash_market_th_official_price}</th>
                  <th className="px-8 py-6 text-right">{t.dash_market_th_our_price}</th>
                  <th className="px-8 py-6 text-center">{t.dash_market_th_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModels.map(model => (
                  <tr key={model.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <Cpu size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-base leading-none mb-1.5">{model.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{model.provider}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {model.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-md tracking-tight border border-slate-200/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <Badge color={model.multiplier === 0 ? 'green' : 'blue'}>
                          {model.multiplier === 0 ? t.model_tag_free : `x${model.multiplier.toFixed(1)}`}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-500 text-xs">
                          <span className="text-[9px] opacity-50">In:</span>
                          <span>${model.officialInput.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-500 text-xs">
                          <span className="text-[9px] opacity-50">Out:</span>
                          <span>${model.officialOutput.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 font-black text-blue-600 text-sm">
                          <span className="text-[9px] opacity-70">输入:</span>
                          <span>${(model.officialInput * model.multiplier).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-black text-orange-600 text-sm">
                          <span className="text-[9px] opacity-70">输出:</span>
                          <span>${(model.officialOutput * model.multiplier).toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() => setView('playground')}
                        className="inline-flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                      >
                        {t.dash_market_th_action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const PlaygroundView = () => (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50/20">
      <div className="flex-1 overflow-y-auto p-10 space-y-8">
        {playgroundMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-xl"><Sparkles size={48} /></div>
            <h4 className="text-2xl font-black">{t.dash_playground_title}</h4>
            <p className="font-bold max-w-xs mx-auto">{t.dash_playground_desc}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {playgroundMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-7 rounded-[2rem] font-bold shadow-sm ${msg.role === 'user' ? 'bg-[#2563EB] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && <div className="p-6 bg-white border border-slate-100 rounded-2xl">{t.dash_thinking}</div>}
          </div>
        )}
      </div>
      <div className="p-10 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex gap-4 bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 focus-within:border-blue-500 focus-within:bg-white transition-all">
          <input
            type="text"
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runPlayground()}
            placeholder={t.dash_input_placeholder}
            className="flex-1 bg-transparent border-none outline-none font-bold text-slate-800 px-4 text-lg"
          />
          <button onClick={runPlayground} disabled={isGenerating} className="w-14 h-14 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );



  return (
    <div className="min-h-screen bg-[#fafafa]">
      {isLoggedIn ? <DashboardLayout /> : <LandingPage />}
    </div>
  );
}

// --- Mount App ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PrakasaAPIApp />);
}
