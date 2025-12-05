"use client"

import React from "react"
import { DataTable, Column } from "@/components/DataTable/DataTable"
import { Badge } from "lucide-react"

// Sample data for different tables
const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    joinDate: "2024-01-15",
    lastLogin: "2024-12-04",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
    joinDate: "2024-02-20",
    lastLogin: "2024-12-03",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Moderator",
    status: "Inactive",
    joinDate: "2024-03-10",
    lastLogin: "2024-11-28",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "User",
    status: "Active",
    joinDate: "2024-04-05",
    lastLogin: "2024-12-04",
  },
  {
    id: 5,
    name: "Tom Brown",
    email: "tom@example.com",
    role: "User",
    status: "Pending",
    joinDate: "2024-11-30",
    lastLogin: "Never",
  },
]

const ordersData = [
  {
    id: "ORD-001",
    customer: "Alice Cooper",
    product: "Premium Plan",
    amount: 299.99,
    status: "Completed",
    date: "2024-12-01",
  },
  {
    id: "ORD-002",
    customer: "Bob Dylan",
    product: "Basic Plan",
    amount: 99.99,
    status: "Processing",
    date: "2024-12-02",
  },
  {
    id: "ORD-003",
    customer: "Charlie Parker",
    product: "Enterprise Plan",
    amount: 599.99,
    status: "Completed",
    date: "2024-12-03",
  },
  {
    id: "ORD-004",
    customer: "Diana Ross",
    product: "Premium Plan",
    amount: 299.99,
    status: "Failed",
    date: "2024-12-04",
  },
]

const analyticsData = [
  {
    metric: "Total Users",
    value: 1250,
    change: "+12%",
    period: "Last 30 days",
  },
  {
    metric: "Revenue",
    value: 45600,
    change: "+8%",
    period: "Last 30 days",
  },
  {
    metric: "Orders",
    value: 156,
    change: "-3%",
    period: "Last 30 days",
  },
  {
    metric: "Conversion Rate",
    value: 3.2,
    change: "+0.5%",
    period: "Last 30 days",
  },
]

// Column definitions
const userColumns: Column[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true, filterable: true },
  { key: "email", label: "Email", sortable: true, filterable: true },
  { key: "role", label: "Role", sortable: true, filterable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    render: (value) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === "Active"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : value === "Inactive"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        }`}
      >
        {value}
      </span>
    ),
  },
  { key: "joinDate", label: "Join Date", sortable: true },
  { key: "lastLogin", label: "Last Login", sortable: true },
]

const orderColumns: Column[] = [
  { key: "id", label: "Order ID", sortable: true, filterable: true },
  { key: "customer", label: "Customer", sortable: true, filterable: true },
  { key: "product", label: "Product", sortable: true, filterable: true },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    render: (value) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === "Completed"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : value === "Processing"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {value}
      </span>
    ),
  },
  { key: "date", label: "Date", sortable: true },
]

const analyticsColumns: Column[] = [
  { key: "metric", label: "Metric", sortable: true },
  {
    key: "value",
    label: "Value",
    sortable: true,
    render: (value, row) => {
      if (row.metric === "Revenue") {
        return `$${value.toLocaleString()}`
      }
      if (row.metric === "Conversion Rate") {
        return `${value}%`
      }
      return value.toLocaleString()
    },
  },
  {
    key: "change",
    label: "Change",
    sortable: true,
    render: (value) => (
      <span
        className={`inline-flex items-center text-sm font-medium ${
          value.startsWith("+")
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {value}
      </span>
    ),
  },
  { key: "period", label: "Period" },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="my-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your data with powerful tables and analytics
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Analytics Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <DataTable
              data={analyticsData}
              columns={analyticsColumns}
              title="Analytics Overview"
              pageSize={10}
              searchable={false}
              exportable={true}
            />
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <DataTable
              data={usersData}
              columns={userColumns}
              title="Users Management"
              pageSize={5}
              searchable={true}
              exportable={true}
            />
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <DataTable
              data={ordersData}
              columns={orderColumns}
              title="Orders Management"
              pageSize={5}
              searchable={true}
              exportable={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
