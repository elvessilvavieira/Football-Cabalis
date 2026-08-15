import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = { title: "Cabalis Futebol", description: "Resultados, classificação e história das nossas temporadas." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt"><body>
    <header className="site-header"><div className="header-inner"><Link className="brand" href="/" aria-label="Cabalis Futebol — início"><span className="brand-mark"><Trophy size={20} strokeWidth={2.4} /></span><span><strong>CABALIS</strong><small>FUTEBOL</small></span></Link><nav aria-label="Navegação principal"><Link href="/">Classificação</Link><Link href="/estatisticas">Estatísticas</Link><Link href="/temporadas">Temporadas</Link></nav></div></header>
    {children}
    <footer><div className="footer-inner"><span className="brand footer-brand"><span className="brand-mark"><Trophy size={16} /></span><span><strong>CABALIS</strong><small>FUTEBOL</small></span></span><p>Feito para guardar cada jogo, cada golo e cada resenha.</p></div></footer>
  </body></html>;
}
