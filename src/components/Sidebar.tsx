import React from 'react';
import {
  LayoutDashboard,
  Lock,
  KeyRound,
  GitCompare,
  Hash,
  AlertTriangle,
  History,
  FileText,
  UserCheck,
  ShieldCheck,
  Github,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openReportModal: () => void;
}

interface NavItem {
  id: string;
  label: string;
  sub?: string;
  icon: React.ElementType;
  action?: () => void;
  warning?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openReportModal,
}) => {
  const navItems: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
        { id: 'history', label: 'Operation Audit Log', icon: History },
      ],
    },
    {
      group: 'CRYPTOGRAPHIC ENGINES',
      items: [
        { id: 'aes', label: 'AES-256-GCM', sub: 'NIST AEAD + Scrypt', icon: Lock },
        { id: 'rsa', label: 'RSA-OAEP', sub: '2048/3072 Modulus', icon: KeyRound },
        { id: 'dh', label: 'Diffie-Hellman', sub: 'MODP Group 14', icon: GitCompare },
        { id: 'sha256', label: 'SHA-256 & File Crypt', sub: 'File/Image Cipher + Hash', icon: Hash },
        { id: 'md5', label: 'MD5 (Legacy)', sub: 'RFC 1321 Collision Study', icon: AlertTriangle, warning: true },
        { id: 'des', label: 'DES-CBC', sub: 'FIPS 46-3 Feistel Study', icon: AlertTriangle, warning: true },
      ],
    },
    {
      group: 'DOCUMENTATION & PROFILE',
      items: [
        { id: 'login', label: 'Login & Register', sub: 'Direct Auth Portal (No OTP)', icon: KeyRound },
        { id: 'report', label: 'Academic Project Report', sub: 'VTU Capstone Evaluation', icon: FileText, action: openReportModal },
        { id: 'profile', label: 'Security & Profile', sub: 'Entropy & Identity', icon: UserCheck },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-[#09090b] p-4 flex flex-col justify-between hidden lg:flex h-full overflow-y-auto select-none">
      <div className="space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              {group.group}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold shadow-sm shadow-orange-500/10'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-orange-500'
                          : item.warning
                          ? 'text-amber-500'
                          : 'text-zinc-500'
                      }`}
                    />
                    <div className="flex-1 truncate">
                      <div className="truncate text-white font-medium">{item.label}</div>
                      {item.sub && (
                        <div className="text-[10px] text-zinc-500 font-normal truncate">
                          {item.sub}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Developer Card & Zero-Knowledge Privacy Seal */}
      <div className="mt-6 space-y-3 pt-4 border-t border-zinc-800/80">
        {/* Ajay G S Developer Info */}
        <div className="rounded-xl border border-zinc-800 bg-black/80 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Lead Developer</span>
            <span className="text-[9px] bg-orange-500/20 text-orange-400 font-mono px-1.5 py-0.5 rounded border border-orange-500/30 font-semibold">
              Author
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-white">Ajay G S</p>
            <p className="text-[10px] text-zinc-400">HKBK College of Engineering</p>
            <p className="text-[10px] text-orange-400/90 font-medium">Guide: Prof. Syeda Ayesha Amreen</p>
          </div>

          <div className="space-y-1 pt-1 border-t border-zinc-800/80 text-[11px]">
            <a
              href="https://github.com/ajaygs01/CipherForge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-300 hover:text-orange-400 transition-colors"
              title="CipherForge GitHub Repository"
            >
              <Github className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="font-mono text-[10px] truncate">github.com/ajaygs01/CipherForge</span>
              <ExternalLink className="h-2.5 w-2.5 ml-auto text-zinc-500" />
            </a>

            <a
              href="tel:9686352137"
              className="flex items-center gap-1.5 text-zinc-300 hover:text-orange-400 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="font-mono text-[10px]">9686352137</span>
            </a>

            <a
              href="mailto:gsajay18@gmail.com"
              className="flex items-center gap-1.5 text-zinc-300 hover:text-orange-400 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="font-mono text-[10px] truncate">gsajay18@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Zero-Knowledge Privacy Seal */}
        <div className="rounded-xl border border-orange-500/20 bg-orange-950/20 p-2.5">
          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span>Zero-Knowledge Seal</span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">
            Keys processed purely in client RAM. Tamper-proof telemetry.
          </p>
        </div>
      </div>
    </aside>
  );
};
