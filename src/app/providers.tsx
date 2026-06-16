'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppProvider, useApp } from '../lib/contexts/AppContext';
import { AuthProvider, useAuth } from '../lib/contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { MobileNav } from '../components/layout/MobileNav';
import type { TabName } from '../types/enums';

function Shell({ children }: { children: React.ReactNode }) {
  const { loading, printPayload } = useApp();
  const { isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/login';

  const activeTab: TabName = pathname === '/' ? 'pos' : (pathname.split('/')[1] as TabName) || 'pos';

  const handleTabChange = useCallback((tab: TabName) => {
    setSidebarOpen(false);
    const path = tab === 'pos' ? '/pos' : `/${tab}`;
    router.push(path);
  }, [router]);

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoginPage, isAuthenticated, router]);

  if (!isAuthenticated && !isLoginPage) return null;

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar activeTab={activeTab} isDarkMode={isDarkMode} isSidebarOpen={isSidebarOpen} onTabChange={handleTabChange} onToggleTheme={toggleTheme} />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <TopBar activeTab={activeTab} loading={loading} onHamburgerClick={() => setSidebarOpen(true)} />
        {children}
      </main>
      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* PRINT AREA */}
      <div id="print-area">
        {printPayload?.type === 'ticket' && (
          <div className="print-ticket">
            <div className="center">
              <h3>{printPayload.settings.business_name}</h3>
              <p>RUC: {printPayload.settings.ruc}</p>
              <p>Telf: {printPayload.settings.phone}</p>
              <p>{printPayload.settings.address}</p>
              <div className="divider"></div>
              <p><strong>TIMBRADO NRO: {printPayload.settings.timbrado_number}</strong></p>
              <p>Vigente: {printPayload.settings.timbrado_start_date} al {printPayload.settings.timbrado_end_date}</p>
              <div className="divider"></div>
              <h4>TICKET FACTURA</h4>
              <p>Nro: {printPayload.sale.invoice_number}</p>
              <p>Fecha: {new Date(printPayload.sale.created_at).toLocaleString('es-PY')}</p>
            </div>
            <div className="divider"></div>
            <div><p><strong>Cliente:</strong> {printPayload.sale.customer_name}</p><p><strong>RUC:</strong> {printPayload.sale.customer_ruc}</p></div>
            <div className="divider"></div>
            <table><thead><tr><th style={{textAlign:'left'}}>Item</th><th className="right" style={{width:'40px'}}>Cant</th><th className="right" style={{width:'70px'}}>Precio</th><th className="right" style={{width:'70px'}}>Total</th></tr></thead>
              <tbody>{printPayload.items.map((item: any, idx: number) => (
                <tr key={idx}><td>{item.product_name} ({item.tax_rate}%)</td><td className="right">{item.quantity}</td><td className="right">{Math.round(item.unit_price).toLocaleString('es-PY')}</td><td className="right">{Math.round(item.subtotal).toLocaleString('es-PY')}</td></tr>
              ))}</tbody>
            </table>
            <div className="divider"></div>
            <table style={{fontWeight:'bold'}}><tbody>
              <tr><td>TOTAL:</td><td className="right" style={{fontSize:'14px'}}>{Math.round(printPayload.sale.total).toLocaleString('es-PY')} Gs.</td></tr>
              <tr><td>Pago:</td><td className="right">{printPayload.sale.payment_method}</td></tr>
              <tr><td>Recibido:</td><td className="right">{Math.round(printPayload.sale.received_amount).toLocaleString('es-PY')} Gs.</td></tr>
              <tr><td>Vuelto:</td><td className="right">{Math.round(printPayload.sale.change_amount).toLocaleString('es-PY')} Gs.</td></tr>
            </tbody></table>
            <div className="divider"></div>
            <div style={{fontSize:'10px'}}>
              <p style={{fontWeight:'bold',textAlign:'center'}}>LIQUIDACIÓN DEL IVA</p>
              <p>Exentas: {Math.round(printPayload.sale.total_exempt).toLocaleString('es-PY')} Gs.</p>
              <p>Grav. 5%: {Math.round(printPayload.sale.total_iva_5 * 21).toLocaleString('es-PY')} Gs.</p>
              <p>Grav. 10%: {Math.round(printPayload.sale.total_iva_10 * 11).toLocaleString('es-PY')} Gs.</p>
              <p>IVA 5%: {Math.round(printPayload.sale.total_iva_5).toLocaleString('es-PY')} Gs.</p>
              <p>IVA 10%: {Math.round(printPayload.sale.total_iva_10).toLocaleString('es-PY')} Gs.</p>
            </div>
            <div className="divider"></div>
            <div className="center" style={{fontSize:'10px',marginTop:'10px'}}><p>{printPayload.settings.receipt_footer}</p><p>*** ORIGINAL CLIENTE ***</p></div>
          </div>
        )}
        {printPayload?.type === 'factura' && (
          <div className="print-invoice">
            <div className="invoice-legal-header">
              <div className="company-info">
                <h2 style={{fontSize:'18px',fontWeight:'bold',marginBottom:'5px'}}>{printPayload.settings.business_name}</h2>
                <p style={{fontSize:'10px',margin:'2px 0'}}>{printPayload.settings.address}</p>
                <p style={{fontSize:'10px',margin:'2px 0'}}>Tel: {printPayload.settings.phone}</p>
              </div>
              <div className="timbrado-info">
                <h3 style={{fontSize:'13px',fontWeight:'bold',margin:'0 0 5px 0'}}>RUC: {printPayload.settings.ruc}</h3>
                <h3 style={{fontSize:'14px',fontWeight:'bold',margin:'0 0 5px 0',textDecoration:'underline'}}>FACTURA</h3>
                <p style={{fontSize:'10px',margin:'2px 0'}}><strong>TIMBRADO: {printPayload.settings.timbrado_number}</strong></p>
                <p style={{fontSize:'12px',fontWeight:'bold',margin:'8px 0 0 0',fontFamily:'monospace'}}>Nro: {printPayload.sale.invoice_number}</p>
              </div>
            </div>
            <div className="invoice-legal-client">
              <div>Fecha: {new Date(printPayload.sale.created_at).toLocaleDateString('es-PY')} | Condición: Contado</div>
              <div style={{margin:'5px 0'}}>Cliente: {printPayload.sale.customer_name}</div>
              <div>RUC: {printPayload.sale.customer_ruc} | Tel: {printPayload.sale.customer_phone || 'S/N'}</div>
              <div>Dirección: {printPayload.sale.customer_address || 'Asunción'}</div>
            </div>
            <table className="invoice-legal-table">
              <thead><tr><th style={{width:'40px'}}>CANT.</th><th>DESCRIPCIÓN</th><th style={{width:'80px'}}>P. UNIT.</th><th style={{width:'80px'}}>EXENTAS</th><th style={{width:'80px'}}>5%</th><th style={{width:'80px'}}>10%</th></tr></thead>
              <tbody>{printPayload.items.map((item: any, idx: number) => (
                <tr key={idx} style={{height:'25px'}}><td style={{textAlign:'center'}}>{item.quantity}</td><td>{item.product_name}</td><td style={{textAlign:'right'}}>{Math.round(item.unit_price).toLocaleString('es-PY')}</td><td style={{textAlign:'right'}}>{item.tax_rate === 0 ? Math.round(item.subtotal).toLocaleString('es-PY') : ''}</td><td style={{textAlign:'right'}}>{item.tax_rate === 5 ? Math.round(item.subtotal).toLocaleString('es-PY') : ''}</td><td style={{textAlign:'right'}}>{item.tax_rate === 10 ? Math.round(item.subtotal).toLocaleString('es-PY') : ''}</td></tr>
              ))}</tbody>
            </table>
            <div className="invoice-legal-summary">
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:'bold'}}>
                <span>SUBTOTALES:</span>
                <span style={{textAlign:'right'}}>{Math.round(printPayload.sale.total_exempt).toLocaleString('es-PY')}</span>
                <span style={{textAlign:'right'}}>{Math.round(printPayload.sale.total_iva_5 * 21).toLocaleString('es-PY')}</span>
                <span style={{textAlign:'right'}}>{Math.round(printPayload.sale.total_iva_10 * 11).toLocaleString('es-PY')}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:'bold',fontSize:'13px',borderTop:'1px solid #000',marginTop:'5px',paddingTop:'5px'}}>
                <span>TOTAL: </span><span>{Math.round(printPayload.sale.total).toLocaleString('es-PY')} Gs.</span>
              </div>
              <div style={{borderTop:'1px solid #000',marginTop:'5px',paddingTop:'5px',fontSize:'10px'}}>
                <strong>IVA:</strong> 5%: {Math.round(printPayload.sale.total_iva_5).toLocaleString('es-PY')} | 10%: {Math.round(printPayload.sale.total_iva_10).toLocaleString('es-PY')}
              </div>
            </div>
            <div className="invoice-legal-footer">
              <div style={{fontSize:'9px'}}>Sistema de facturación SET</div>
              <div style={{fontWeight:'bold',textDecoration:'underline'}}>ORIGINAL: CLIENTE</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <Shell>{children}</Shell>
      </AppProvider>
    </AuthProvider>
  );
}
