import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  CheckCircle,
  CircleHelp,
  CreditCard,
  FileText,
  Home,
  ImagePlus,
  ListPlus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  Zap,
} from 'lucide-react';
import { API_ADMIN_URL } from '../config';
import { apiFetch } from '../apiClient';

const API = API_ADMIN_URL;
const getToken = () => localStorage.getItem('adminToken');

const defaultKeys = ['support-center', 'user-guide', 'refund-policy', 'terms-of-service', 'home-banner'];

const iconMap = {
  support: CircleHelp,
  guide: FileText,
  policy: CreditCard,
  home_banner: Home,
  Search,
  ShieldCheck,
  CircleHelp,
  UserRound,
  BadgeCheck,
  Sparkles,
  Zap,
};

const emptyTextSection = { title: 'Tiêu đề mới', body: 'Nội dung mới' };
const emptyCard = { icon: 'CircleHelp', title: 'Mục mới', text: 'Nội dung mô tả' };
const emptyStep = {
  phase: 'Bước mới',
  icon: 'BadgeCheck',
  title: 'Tiêu đề bước',
  text: 'Mô tả bước',
  checklist: ['Checklist mới'],
};
const emptyFeature = { icon: 'Sparkles', title: 'Tính năng mới', copy: 'Mô tả ngắn' };
const emptyTile = { title: 'Card mới', copy: 'Mô tả card', image: '' };

const deepClone = (value) => JSON.parse(JSON.stringify(value || {}));

const setNested = (object, path, value) => {
  const next = deepClone(object);
  let cursor = next;
  path.slice(0, -1).forEach((key) => {
    if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  });
  cursor[path[path.length - 1]] = value;
  return next;
};

const Editable = ({ value, onChange, multiline = false, className = '', placeholder = '', rows = 3 }) => {
  const commonClass = `w-full rounded-lg border border-transparent bg-white/10 px-2 py-1 outline-none transition focus:border-[#6ec6a0] focus:bg-white/95 focus:text-slate-900 ${className}`;

  if (multiline) {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${commonClass} resize-none`}
      />
    );
  }

  return (
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={commonClass}
    />
  );
};

const ListActions = ({ onAdd }) => (
  <button
    type="button"
    onClick={onAdd}
    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
  >
    <ListPlus size={14} /> Thêm
  </button>
);

const PreviewFrame = ({ item, status, setStatus, saving, loading, onReset, onSave, children }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preview & chỉnh sửa trực tiếp</p>
        <h2 className="mt-1 text-lg font-black text-slate-900">{item?.label || item?.title || 'Nội dung'}</h2>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">
          {item?.content_key || item?.key} · v{item?.version || 0}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {loading && <RefreshCw size={15} className="animate-spin text-[#6ec6a0]" />}
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <div className="max-h-[calc(100vh-300px)] overflow-auto bg-[#f8fafc]">{children}</div>

    <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
      <button
        type="button"
        onClick={onReset}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
      >
        <RotateCcw size={14} /> Reset
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-[#1a3a5c] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#14304d] disabled:opacity-60"
      >
        <Save size={14} className="text-[#6ec6a0]" /> Lưu
      </button>
    </div>
  </div>
);

const PolicyPreview = ({ data, setData }) => {
  const sections = data.sections || [];

  return (
    <div className="p-6">
      <section className="mb-5 rounded-2xl bg-[#102a43] p-8 text-white">
        <Editable
          value={data.hero?.badge}
          onChange={(value) => setData(setNested(data, ['hero', 'badge'], value))}
          className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-200"
        />
        <Editable
          value={data.hero?.title}
          onChange={(value) => setData(setNested(data, ['hero', 'title'], value))}
          className="text-3xl font-black leading-tight"
        />
        <Editable
          multiline
          value={data.hero?.description}
          onChange={(value) => setData(setNested(data, ['hero', 'description'], value))}
          className="mt-3 text-slate-200"
        />
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6">
        <div className="flex justify-end">
          <ListActions onAdd={() => setData({ ...data, sections: [...sections, { ...emptyTextSection }] })} />
        </div>

        {sections.map((section, index) => (
          <div key={index} className="group rounded-xl border border-transparent p-2 hover:border-slate-100">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Editable
                  value={section.title}
                  onChange={(value) =>
                    setData({ ...data, sections: sections.map((item, i) => (i === index ? { ...item, title: value } : item)) })
                  }
                  className="text-xl font-black text-slate-900"
                />
                <Editable
                  multiline
                  value={section.body}
                  onChange={(value) =>
                    setData({ ...data, sections: sections.map((item, i) => (i === index ? { ...item, body: value } : item)) })
                  }
                  className="mt-2 text-slate-600"
                />
              </div>
              <button
                type="button"
                onClick={() => setData({ ...data, sections: sections.filter((_, i) => i !== index) })}
                className="rounded-lg p-2 text-red-500 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

const SupportPreview = ({ data, setData }) => {
  const cards = data.cards || [];

  return (
    <div className="p-6">
      <section className="mb-5 rounded-2xl bg-[#102a43] p-8 text-white">
        <Editable
          value={data.hero?.badge}
          onChange={(value) => setData(setNested(data, ['hero', 'badge'], value))}
          className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-200"
        />
        <Editable
          value={data.hero?.title}
          onChange={(value) => setData(setNested(data, ['hero', 'title'], value))}
          className="text-3xl font-black"
        />
        <Editable
          multiline
          value={data.hero?.description}
          onChange={(value) => setData(setNested(data, ['hero', 'description'], value))}
          className="mt-3 text-slate-200"
        />
      </section>

      <div className="mb-3 flex justify-end">
        <ListActions onAdd={() => setData({ ...data, cards: [...cards, { ...emptyCard }] })} />
      </div>
      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = iconMap[card.icon] || CircleHelp;
          return (
            <article key={index} className="group rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex justify-between gap-2">
                <Icon size={22} className="mb-3 text-[#1a3a5c]" />
                <button
                  type="button"
                  onClick={() => setData({ ...data, cards: cards.filter((_, i) => i !== index) })}
                  className="text-red-500 opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <Editable
                value={card.icon}
                onChange={(value) =>
                  setData({ ...data, cards: cards.map((item, i) => (i === index ? { ...item, icon: value } : item)) })
                }
                className="mb-2 text-xs font-bold text-slate-400"
              />
              <Editable
                value={card.title}
                onChange={(value) =>
                  setData({ ...data, cards: cards.map((item, i) => (i === index ? { ...item, title: value } : item)) })
                }
                className="font-black text-slate-900"
              />
              <Editable
                multiline
                value={card.text}
                onChange={(value) =>
                  setData({ ...data, cards: cards.map((item, i) => (i === index ? { ...item, text: value } : item)) })
                }
                className="mt-2 text-sm text-slate-500"
              />
            </article>
          );
        })}
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <Editable
          value={data.contact?.title}
          onChange={(value) => setData(setNested(data, ['contact', 'title'], value))}
          className="text-xl font-black text-slate-900"
        />
        <Editable
          multiline
          value={data.contact?.description}
          onChange={(value) => setData(setNested(data, ['contact', 'description'], value))}
          className="mt-1 text-slate-500"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Editable
            value={data.contact?.phone}
            onChange={(value) => setData(setNested(data, ['contact', 'phone'], value))}
            className="text-sm font-bold text-[#1a3a5c]"
          />
          <Editable
            value={data.contact?.email}
            onChange={(value) => setData(setNested(data, ['contact', 'email'], value))}
            className="text-sm font-bold text-[#1a3a5c]"
          />
          <Editable
            value={data.contact?.guideLinkText}
            onChange={(value) => setData(setNested(data, ['contact', 'guideLinkText'], value))}
            className="text-sm font-bold text-[#1a3a5c]"
          />
        </div>
      </section>
    </div>
  );
};

const GuidePreview = ({ data, setData }) => {
  const roadmap = data.roadmap || [];
  const quickTips = data.quickTips || [];

  return (
    <div className="p-6">
      <section className="mb-5 rounded-2xl bg-[#102a43] p-8 text-white">
        <Editable
          value={data.hero?.badge}
          onChange={(value) => setData(setNested(data, ['hero', 'badge'], value))}
          className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-200"
        />
        <Editable
          value={data.hero?.title}
          onChange={(value) => setData(setNested(data, ['hero', 'title'], value))}
          className="text-3xl font-black"
        />
        <Editable
          multiline
          value={data.hero?.description}
          onChange={(value) => setData(setNested(data, ['hero', 'description'], value))}
          className="mt-3 text-slate-200"
        />
      </section>

      <div className="mb-3 flex justify-end">
        <ListActions onAdd={() => setData({ ...data, roadmap: [...roadmap, { ...emptyStep }] })} />
      </div>
      <div className="space-y-3">
        {roadmap.map((step, index) => (
          <article key={index} className="group rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <Editable
                    value={step.phase}
                    onChange={(value) =>
                      setData({ ...data, roadmap: roadmap.map((item, i) => (i === index ? { ...item, phase: value } : item)) })
                    }
                    className="text-xs font-black uppercase text-[#1a3a5c]"
                  />
                  <Editable
                    value={step.icon}
                    onChange={(value) =>
                      setData({ ...data, roadmap: roadmap.map((item, i) => (i === index ? { ...item, icon: value } : item)) })
                    }
                    className="text-xs font-bold text-slate-400"
                  />
                </div>
                <Editable
                  value={step.title}
                  onChange={(value) =>
                    setData({ ...data, roadmap: roadmap.map((item, i) => (i === index ? { ...item, title: value } : item)) })
                  }
                  className="mt-1 text-lg font-black text-slate-900"
                />
                <Editable
                  multiline
                  value={step.text}
                  onChange={(value) =>
                    setData({ ...data, roadmap: roadmap.map((item, i) => (i === index ? { ...item, text: value } : item)) })
                  }
                  className="mt-2 text-sm text-slate-500"
                />
                <Editable
                  multiline
                  value={(step.checklist || []).join('\n')}
                  onChange={(value) =>
                    setData({
                      ...data,
                      roadmap: roadmap.map((item, i) =>
                        i === index ? { ...item, checklist: value.split('\n').filter(Boolean) } : item,
                      ),
                    })
                  }
                  className="mt-3 text-xs text-slate-600"
                />
              </div>
              <button
                type="button"
                onClick={() => setData({ ...data, roadmap: roadmap.filter((_, i) => i !== index) })}
                className="h-9 rounded-lg p-2 text-red-500 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">Quick tips</h3>
          <ListActions onAdd={() => setData({ ...data, quickTips: [...quickTips, { ...emptyCard }] })} />
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {quickTips.map((tip, index) => (
            <div key={index} className="group rounded-xl bg-slate-50 p-3">
              <button
                type="button"
                onClick={() => setData({ ...data, quickTips: quickTips.filter((_, i) => i !== index) })}
                className="float-right text-red-500 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
              <Editable
                value={tip.icon}
                onChange={(value) =>
                  setData({ ...data, quickTips: quickTips.map((item, i) => (i === index ? { ...item, icon: value } : item)) })
                }
                className="text-xs font-bold text-slate-400"
              />
              <Editable
                value={tip.title}
                onChange={(value) =>
                  setData({ ...data, quickTips: quickTips.map((item, i) => (i === index ? { ...item, title: value } : item)) })
                }
                className="mt-1 font-black text-slate-900"
              />
              <Editable
                multiline
                value={tip.text}
                onChange={(value) =>
                  setData({ ...data, quickTips: quickTips.map((item, i) => (i === index ? { ...item, text: value } : item)) })
                }
                className="mt-1 text-sm text-slate-500"
              />
            </div>
          ))}
        </div>
      </div>

      <section className="mt-5 rounded-xl border border-slate-100 bg-white p-5">
        <Editable
          value={data.cta?.title}
          onChange={(value) => setData(setNested(data, ['cta', 'title'], value))}
          className="text-xl font-black text-slate-900"
        />
        <Editable
          multiline
          value={data.cta?.description}
          onChange={(value) => setData(setNested(data, ['cta', 'description'], value))}
          className="mt-1 text-slate-500"
        />
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Editable
            value={data.cta?.buttonText}
            onChange={(value) => setData(setNested(data, ['cta', 'buttonText'], value))}
            className="text-sm font-bold text-[#1a3a5c]"
          />
          <Editable
            value={data.cta?.buttonUrl}
            onChange={(value) => setData(setNested(data, ['cta', 'buttonUrl'], value))}
            className="text-sm font-bold text-[#1a3a5c]"
          />
        </div>
      </section>
    </div>
  );
};

const HomeBannerPreview = ({ data, setData }) => {
  const imageInputRef = useRef(null);
  const hero = data.hero || {};
  const features = data.features || [];
  const tiles = data.tiles || [];

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setData(setNested(data, ['hero', 'image'], reader.result));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="p-6">
      <section className="grid grid-cols-1 gap-5 rounded-2xl bg-[#102a43] p-8 text-white xl:grid-cols-[1fr_320px]">
        <div>
          <Editable
            value={hero.badge}
            onChange={(value) => setData(setNested(data, ['hero', 'badge'], value))}
            className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-200"
          />
          <h1 className="text-4xl font-black leading-tight">
            <Editable
              value={hero.titleLine1}
              onChange={(value) => setData(setNested(data, ['hero', 'titleLine1'], value))}
              className="block"
            />
            <Editable
              value={hero.titleLine2}
              onChange={(value) => setData(setNested(data, ['hero', 'titleLine2'], value))}
              className="block"
            />
          </h1>
          <Editable
            multiline
            value={hero.description}
            onChange={(value) => setData(setNested(data, ['hero', 'description'], value))}
            className="mt-4 text-slate-200"
          />
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Editable
              value={hero.primaryCtaText}
              onChange={(value) => setData(setNested(data, ['hero', 'primaryCtaText'], value))}
              className="bg-white font-black text-[#102a43]"
            />
            <Editable
              value={hero.secondaryCtaText}
              onChange={(value) => setData(setNested(data, ['hero', 'secondaryCtaText'], value))}
              className="border border-white/30 font-black"
            />
            <Editable
              value={hero.primaryCtaUrl}
              onChange={(value) => setData(setNested(data, ['hero', 'primaryCtaUrl'], value))}
              className="text-xs text-slate-200"
            />
            <Editable
              value={hero.secondaryCtaUrl}
              onChange={(value) => setData(setNested(data, ['hero', 'secondaryCtaUrl'], value))}
              className="text-xs text-slate-200"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="group relative h-72 overflow-hidden rounded-xl border border-white/20 bg-white/10 text-left"
          title="Click để upload ảnh"
        >
          {hero.image ? (
            <img src={hero.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/70">
              <ImagePlus size={34} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/55 px-4 py-3 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            Click để upload ảnh banner
          </div>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </button>
      </section>

      <section className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
        <Editable
          multiline
          value={(data.proofs || []).join('\n')}
          onChange={(value) => setData({ ...data, proofs: value.split('\n').filter(Boolean) })}
          className="text-sm font-bold text-slate-600"
        />
      </section>

      <div className="mt-4 flex justify-end">
        <ListActions onAdd={() => setData({ ...data, features: [...features, { ...emptyFeature }] })} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div key={index} className="group rounded-xl border border-slate-100 bg-white p-4">
            <button
              type="button"
              onClick={() => setData({ ...data, features: features.filter((_, i) => i !== index) })}
              className="float-right text-red-500 opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
            <Editable
              value={feature.icon}
              onChange={(value) =>
                setData({ ...data, features: features.map((item, i) => (i === index ? { ...item, icon: value } : item)) })
              }
              className="text-xs font-bold text-slate-400"
            />
            <Editable
              value={feature.title}
              onChange={(value) =>
                setData({ ...data, features: features.map((item, i) => (i === index ? { ...item, title: value } : item)) })
              }
              className="font-black text-slate-900"
            />
            <Editable
              multiline
              value={feature.copy}
              onChange={(value) =>
                setData({ ...data, features: features.map((item, i) => (i === index ? { ...item, copy: value } : item)) })
              }
              className="mt-1 text-sm text-slate-500"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <ListActions onAdd={() => setData({ ...data, tiles: [...tiles, { ...emptyTile }] })} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {tiles.map((tile, index) => (
          <div key={index} className="group overflow-hidden rounded-xl border border-slate-100 bg-white">
            <div className="relative h-40 bg-slate-100">
              {tile.image && <img src={tile.image} alt="" className="h-full w-full object-cover" />}
              <button
                type="button"
                onClick={() => setData({ ...data, tiles: tiles.filter((_, i) => i !== index) })}
                className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-red-500 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="p-4">
              <Editable
                value={tile.title}
                onChange={(value) =>
                  setData({ ...data, tiles: tiles.map((item, i) => (i === index ? { ...item, title: value } : item)) })
                }
                className="font-black text-slate-900"
              />
              <Editable
                multiline
                value={tile.copy}
                onChange={(value) =>
                  setData({ ...data, tiles: tiles.map((item, i) => (i === index ? { ...item, copy: value } : item)) })
                }
                className="mt-1 text-sm text-slate-500"
              />
              <Editable
                value={tile.image}
                onChange={(value) =>
                  setData({ ...data, tiles: tiles.map((item, i) => (i === index ? { ...item, image: value } : item)) })
                }
                className="mt-2 text-xs text-slate-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InlinePreview = ({ item, data, setData }) => {
  if (!item) return null;
  if (item.template === 'support') return <SupportPreview data={data} setData={setData} />;
  if (item.template === 'guide') return <GuidePreview data={data} setData={setData} />;
  if (item.template === 'home_banner') return <HomeBannerPreview data={data} setData={setData} />;
  return <PolicyPreview data={data} setData={setData} />;
};

const ContentManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedKey, setSelectedKey] = useState(defaultKeys[0]);
  const [item, setItem] = useState(null);
  const [data, setData] = useState({});
  const [status, setStatus] = useState('published');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.key === selectedKey),
    [templates, selectedKey],
  );

  const authHeaders = {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchTemplates = async () => {
    const res = await apiFetch(`${API}/content/templates`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await res.json();
    if (res.ok) setTemplates(result.templates || []);
  };

  const fetchItem = async (key = selectedKey) => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/content/${key}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();
      if (res.ok) {
        setItem(result.item);
        setData(deepClone(result.item.data || {}));
        setStatus(result.item.status || 'published');
      }
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!item && !selectedTemplate) return;

    const source = item || selectedTemplate;
    setSaving(true);
    try {
      const res = await apiFetch(`${API}/content/${selectedKey}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          title: data.hero?.title || [data.hero?.titleLine1, data.hero?.titleLine2].filter(Boolean).join(' ') || source.title,
          type: source.type,
          slug: source.slug,
          summary: source.summary,
          template: source.template,
          status,
          isActive: status === 'published',
          data,
        }),
      });
      const result = await res.json();
      showMessage(res.ok ? 'Đã lưu thay đổi' : result.error || 'Lưu thất bại');
      if (res.ok) {
        setItem(result.item);
        fetchItem(selectedKey);
      }
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`${API}/content/${selectedKey}/reset`, {
        method: 'POST',
        headers: authHeaders,
      });
      const result = await res.json();
      showMessage(res.ok ? 'Đã reset nội dung' : result.error || 'Reset thất bại');
      if (res.ok) fetchItem(selectedKey);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchItem(selectedKey);
  }, [selectedKey]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen space-y-6 bg-[#f5f7fa] p-6 md:p-8">
      <div className="flex flex-col gap-4 pb-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold text-slate-400">Quản trị thông tin hệ thống</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Quản lý Nội dung</h1>
        </div>
        <button
          onClick={() => fetchItem(selectedKey)}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#6ec6a0]' : ''} />
          Tải lại dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Mục nội dung</h2>
          <div className="space-y-2">
            {(templates.length ? templates : defaultKeys.map((key) => ({ key, label: key }))).map((template) => {
              const Icon = iconMap[template.template] || FileText;
              const active = selectedKey === template.key;
              return (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => setSelectedKey(template.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                    active ? 'bg-[#1a3a5c] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-[#6ec6a0]' : 'text-slate-400'} />
                  <span className="text-sm font-bold">{template.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <PreviewFrame
          item={item || selectedTemplate}
          status={status}
          setStatus={setStatus}
          saving={saving}
          loading={loading}
          onReset={reset}
          onSave={save}
        >
          <InlinePreview item={item || selectedTemplate} data={data} setData={setData} />
        </PreviewFrame>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl bg-[#1a3a5c] px-5 py-3.5 text-sm font-medium text-white shadow-xl"
          >
            <CheckCircle size={16} className="text-[#6ec6a0]" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContentManagement;
