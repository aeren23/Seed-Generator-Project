import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { saleService } from '../api/saleService';
import type { SaleChartData } from '../types';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome: React.FC = () => {
  const [data, setData] = useState<SaleChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await saleService.getChartData();
        // Format dates for display
        const formattedData = res.map(item => ({
          ...item,
          displayDate: new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Grafik verisi alınamadı', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalItemsSold = data.reduce((sum, item) => sum + item.totalItems, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Satıcı Paneli</h1>
          <p className="text-slate-500">Mağaza performansınızı ve satış trendlerinizi takip edin.</p>
        </div>
        <Link 
          to="/seller/inventory" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-600/20 transition-all"
        >
          Envanter Yönetimi
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Toplam Gelir</p>
            <h3 className="text-2xl font-bold text-slate-900">₺{totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Satılan Ürün</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalItemsSold} Adet</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Günlük Ortalama</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ₺{data.length ? (totalRevenue / data.length).toFixed(2) : '0.00'}
            </h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Satış Performansı (Zaman / Gelir)</h3>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₺${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₺${Number(value).toFixed(2)}`, 'Gelir']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="totalRevenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-slate-400">
            <p>Henüz gösterilecek satış verisi bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
