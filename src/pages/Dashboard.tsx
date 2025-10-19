import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { DollarSign, Users, Package, Activity } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

type Stats = {
  revenue: number;
  customers: number;
  products: number;
};

type RecentSale = {
  id: string;
  created_at: string;
  total_amount: number;
  customers: { name: string } | null;
  employees: { name: string } | null;
};

type ChartData = {
  name: string;
  'داهات': number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [salesChartData, setSalesChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, salesData, chartDataResult] = await Promise.all([
          fetchStats(),
          fetchRecentSales(),
          fetchSalesForChart(),
        ]);

        setStats(statsData);
        setRecentSales(salesData);
        setSalesChartData(chartDataResult);

      } catch (err) {
        console.error(err);
        setError('هەڵەیەک ڕوویدا لە کاتی هێنانی داتاکان.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function fetchStats(): Promise<Stats> {
    const { data: sales, error: salesError } = await supabase.from('sales').select('total_amount');
    const { count: customerCount, error: customerError } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: productCount, error: productError } = await supabase.from('products').select('*', { count: 'exact', head: true });

    if (salesError || customerError || productError) throw new Error('Failed to fetch stats');

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    return { revenue: totalRevenue, customers: customerCount ?? 0, products: productCount ?? 0 };
  }

  async function fetchRecentSales(): Promise<RecentSale[]> {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('id, created_at, total_amount, customer_id, employee_id')
      .order('created_at', { ascending: false })
      .limit(5);
  
    if (salesError) {
      console.error("Error fetching sales:", salesError);
      throw new Error('Failed to fetch recent sales');
    }
  
    if (!salesData) {
      return [];
    }
  
    const customerIds = [
      ...new Set(salesData.map((s) => s.customer_id).filter(Boolean)),
    ] as string[];
    const employeeIds = [
      ...new Set(salesData.map((s) => s.employee_id).filter(Boolean)),
    ] as string[];
  
    const [customersResult, employeesResult] = await Promise.all([
      customerIds.length > 0
        ? supabase.from('customers').select('id, name').in('id', customerIds)
        : Promise.resolve({ data: [], error: null }),
      employeeIds.length > 0
        ? supabase.from('employees').select('id, name').in('id', employeeIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  
    if (customersResult.error) {
      console.error("Error fetching customers:", customersResult.error);
      throw new Error('Failed to fetch related customer data');
    }
    if (employeesResult.error) {
      console.error("Error fetching employees:", employeesResult.error);
      throw new Error('Failed to fetch related employee data');
    }
  
    const customersMap = new Map(
      customersResult.data?.map((c) => [c.id, c.name])
    );
    const employeesMap = new Map(
      employeesResult.data?.map((e) => [e.id, e.name])
    );
  
    const combinedData: RecentSale[] = salesData.map((sale) => ({
      id: sale.id,
      created_at: sale.created_at,
      total_amount: sale.total_amount,
      customers: sale.customer_id
        ? { name: customersMap.get(sale.customer_id) || 'کڕیاری سڕاوە' }
        : null,
      employees: sale.employee_id
        ? { name: employeesMap.get(sale.employee_id) || 'کارمەندی سڕاوە' }
        : null,
    }));
  
    return combinedData;
  }

  async function fetchSalesForChart(): Promise<ChartData[]> {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d;
    }).reverse();

    const salesPromises = last7Days.map(day => {
      const start = new Date(day.setHours(0, 0, 0, 0)).toISOString();
      const end = new Date(day.setHours(23, 59, 59, 999)).toISOString();
      return supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', start)
        .lte('created_at', end);
    });

    const results = await Promise.all(salesPromises);
    
    return results.map((result, i) => {
      const day = last7Days[i];
      const total = result.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      return {
        name: day.toLocaleDateString('ckb-IQ', { weekday: 'short' }),
        'داهات': total,
      };
    });
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="h-8 w-8 animate-spin" />
        <p className="mr-2">...داتاکان دادەبەزێنرێن</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کۆی گشتی داهات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="rtl">{formatCurrency(stats?.revenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">کۆی گشتی داهاتی فرۆش</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کڕیارەکان</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customers ?? 0}</div>
            <p className="text-xs text-muted-foreground">کۆی گشتی ژمارەی کڕیارەکان</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کاڵاکان</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.products ?? 0}</div>
            <p className="text-xs text-muted-foreground">کۆی گشتی کاڵاکانی ناو کۆگا</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>کورتەی داهات</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(Number(value))}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ direction: 'rtl' }}
                  formatter={(value) => [formatCurrency(Number(value)), 'داهات']}
                />
                <Legend />
                <Bar dataKey="داهات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>دوایین فرۆشەکان</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کڕیار</TableHead>
                  <TableHead>بڕ</TableHead>
                  <TableHead>کات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="font-medium">{sale.customers?.name ?? 'نەزانراو'}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        فرۆشیار: {sale.employees?.name ?? 'نەزانراو'}
                      </div>
                    </TableCell>
                    <TableCell dir="rtl">{formatCurrency(sale.total_amount)}</TableCell>
                    <TableCell className="text-left">{formatDateTime(sale.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
