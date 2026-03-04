import { Download, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-[#e0e0e0] flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <select className="px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white text-sm">
          <option>2024</option>
          <option>2023</option>
          <option>2022</option>
        </select>
        <select className="px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white text-sm">
          <option>All Products</option>
          <option>Green Coffee</option>
          <option>Cocoa</option>
          <option>Cashew</option>
        </select>
        <select className="px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white text-sm">
          <option>All Origins</option>
          <option>Uganda</option>
          <option>Kenya</option>
          <option>Tanzania</option>
        </select>
        <select className="px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white text-sm">
          <option>Last 12 Months</option>
          <option>Last 6 Months</option>
          <option>Last 3 Months</option>
          <option>Custom Range</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0d5c3d] text-white rounded-lg hover:bg-[#0a4a30] transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>
        <div className="w-10 h-10 bg-[#e8f5f0] rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-[#0d5c3d]" />
        </div>
      </div>
    </header>
  );
}
