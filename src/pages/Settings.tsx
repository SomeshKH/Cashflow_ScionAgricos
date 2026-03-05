import { Save, User, Bell, Database, Shield } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Settings</h1>
        <p className="text-[#6b6b6b]">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#e8f5f0] rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[#0d5c3d]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Profile Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Email</label>
              <input
                type="email"
                defaultValue="john.doe@scionagricos.com"
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Role</label>
              <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
                <option>Financial Manager</option>
                <option>Executive</option>
                <option>Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Department</label>
              <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
                <option>Finance</option>
                <option>Operations</option>
                <option>Executive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#e8f5f0] rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#0d5c3d]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#e0e0e0]">
            <div>
              <div className="font-medium text-[#1a1a1a]">Email Notifications</div>
              <div className="text-sm text-[#6b6b6b]">Receive email alerts for important updates</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#0d5c3d]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#e0e0e0]">
            <div>
              <div className="font-medium text-[#1a1a1a]">Shipment Alerts</div>
              <div className="text-sm text-[#6b6b6b]">Get notified about shipment status changes</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#0d5c3d]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#e0e0e0]">
            <div>
              <div className="font-medium text-[#1a1a1a]">Financial Alerts</div>
              <div className="text-sm text-[#6b6b6b]">Alerts for margin drops or cash flow issues</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#0d5c3d]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-[#1a1a1a]">Weekly Reports</div>
              <div className="text-sm text-[#6b6b6b]">Weekly summary of key metrics</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#e0e0e0]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Data & Export Settings */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#e8f5f0] rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-[#0d5c3d]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Data & Export</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Default Currency</label>
            <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Date Format</label>
            <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Export Format</label>
            <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
              <option>Excel (.xlsx)</option>
              <option>CSV (.csv)</option>
              <option>PDF (.pdf)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#e8f5f0] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#0d5c3d]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#e0e0e0]">
            <div>
              <div className="font-medium text-[#1a1a1a]">Two-Factor Authentication</div>
              <div className="text-sm text-[#6b6b6b]">Add an extra layer of security</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#e0e0e0]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>

          <div className="py-3 border-b border-[#e0e0e0]">
            <div className="font-medium text-[#1a1a1a] mb-2">Change Password</div>
            <button className="text-sm text-[#0d5c3d] hover:underline">Update password</button>
          </div>

          <div className="py-3">
            <div className="font-medium text-[#1a1a1a] mb-2">Session Timeout</div>
            <select className="px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Settings */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Company Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Company Name</label>
            <input
              type="text"
              defaultValue="ScionAgricos"
              className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Fiscal Year Start</label>
              <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
                <option>January</option>
                <option>April</option>
                <option>July</option>
                <option>October</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Time Zone</label>
              <select className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white">
                <option>UTC</option>
                <option>EST (UTC-5)</option>
                <option>PST (UTC-8)</option>
                <option>EAT (UTC+3)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0d5c3d] text-white rounded-lg hover:bg-[#0a4a30] transition-colors">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
