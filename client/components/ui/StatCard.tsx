export function StatCard({ title, value, Icon, loading }: { title: string; value: number; Icon: any; loading: boolean }) {
  return (
    <div className="p-5 bg-white/80 rounded-xl flex justify-between items-center border border-slate-100 ">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">{loading ? <span className="w-16 h-8 skeleton inline-block rounded" /> : value.toLocaleString()}</p>
      </div>
      <div className="p-3 rounded-full  text-blue-600">
        <Icon className="w-6 h-6 -mb-8" />
      </div>
    </div>
  );
}