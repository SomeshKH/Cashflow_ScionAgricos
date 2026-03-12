import { Download, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-[#0d5c3d] border-b border-[#0a4a30] flex items-center justify-between px-8 text-white">
      <div className="flex items-center gap-4">
        <select className="px-4 py-2 border border-[#ffffff40] rounded-lg bg-[#0a4a30] text-sm text-white">
          <option>2025</option>
          <option>2024</option>
          <option>2023</option>
        </select>
        <select className="px-4 py-2 border border-[#ffffff40] rounded-lg bg-[#0a4a30] text-sm text-white">
          <option>All Products</option>
          <option>Fresh Produce</option>
          <option>Spices</option>
          <option>Grains</option>
          <option>Processed Foods</option>
        </select>
        <select className="px-4 py-2 border border-[#ffffff40] rounded-lg bg-[#0a4a30] text-sm text-white">
          <option>All Origins</option>
          <option>Brazil</option>
          <option>Argentina</option>
          <option>Peru</option>
          <option>Colombia</option>
        </select>
        <select className="px-4 py-2 border border-[#ffffff40] rounded-lg bg-[#0a4a30] text-sm text-white">
          <option>Last 12 Months</option>
          <option>Last 6 Months</option>
          <option>Last 3 Months</option>
          <option>Custom Range</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#0d5c3d] rounded-lg hover:bg-[#e8f5f0] transition-colors font-medium">
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>
        <div className="w-10 h-10 bg-[#ffffff20] rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
}
