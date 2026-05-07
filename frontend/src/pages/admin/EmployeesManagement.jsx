import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Badge, LoadingSpinner } from '../../components/ui'
import { employeeService } from '../../lib/api'
import { Search, Edit2, Eye } from 'lucide-react'

function EmployeesManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await employeeService.getAllEmployees(page, 20, search)
        setEmployees(data.data || [])
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        setError(err.message || 'Failed to load employees')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchEmployees, 300)
    return () => clearTimeout(timer)
  }, [search, page])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'inactive': return 'red'
      case 'on_leave': return 'yellow'
      case 'terminated': return 'red'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Employees</h1>
        <p className="text-gray-400">Manage employee profiles and details</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search by name, email, or employee ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="flex-1"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Employee</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Department</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Points</th>
                  <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">{emp.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300">{emp.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-400 text-sm">{emp.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(emp.status)}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-orange-500">{emp.rewardPoints}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="p-2 hover:bg-gray-700 rounded transition">
                          <Eye size={16} className="text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded transition">
                          <Edit2 size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded">
              <span className="text-gray-400">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EmployeesManagement
