import { ComponentChildren } from "preact";

interface AdminLayoutProps {
  children: ComponentChildren;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div class="flex items-center space-x-4">
            <a
              href="/admin/availability"
              class="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Manage Availability
            </a>
            <a
              href="/logout"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          {children}
        </div>
      </main>
    </div>
  );
}
