import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Badge, LoadingSpinner, Modal } from '../../components/ui'
import { employeeService } from '../../lib/api'
import { Edit2, Eye } from 'lucide-react'

function EmployeesManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    position: '',
    status: 'active',
    rewardPoints: 0,
    totalBonus: 0,
  })

  const fetchEmployees = async (currentPage = page, currentSearch = search) => {
    setLoading(true)
    setError('')
    try {
      const data = await employeeService.getAllEmployees(currentPage, 20, currentSearch)
      setEmployees(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(page, search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, page])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'inactive':
        return 'red'
      case 'on_leave':
        return 'yellow'
      case 'terminated':
        return 'red'
      default:
        return 'default'
    }
  }

  const openView = (employee) => {
    setSelectedEmployee(employee)
    setViewModalOpen(true)
  }

  const openEdit = (employee) => {
    setSelectedEmployee(employee)
    setEditForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phone: employee.phone || '',
      department: employee.department || '',
      position: employee.position || '',
      status: employee.status || 'active',
      rewardPoints: employee.rewardPoints || 0,
      totalBonus: employee.totalBonus || 0,
    })
    setEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!selectedEmployee?._id) return

    setSaveLoading(true)
    setError('')
    try {
      const response = await employeeService.updateEmployeeById(selectedEmployee._id, {
        ...editForm,
        rewardPoints: Number(editForm.rewardPoints) || 0,
        totalBonus: Number(editForm.totalBonus) || 0,
      })

      const updated = response?.data || response
      setEmployees((prev) => prev.map((emp) => (emp._id === updated._id ? updated : emp)))
      setSelectedEmployee(updated)
      setEditModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to update employee')
    } finally {
      setSaveLoading(false)
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
          <Card className="p-0 overflow-hidden">
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
                        <Badge variant={getStatusColor(emp.status)}>{emp.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-orange-500">{emp.rewardPoints}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openView(emp)}
                            className="p-2 hover:bg-gray-700 rounded transition"
                            title="View employee"
                          >
                            <Eye size={16} className="text-gray-300" />
                          </button>
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-2 hover:bg-gray-700 rounded transition"
                            title="Edit employee"
                          >
                            <Edit2 size={16} className="text-gray-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded">
              <span className="text-gray-400">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Employee Details"
        footer={<Button variant="secondary" onClick={() => setViewModalOpen(false)}>Close</Button>}
      >
        {selectedEmployee && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-white">{selectedEmployee.firstName} {selectedEmployee.lastName}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Employee ID</span><span className="text-white">{selectedEmployee.employeeId}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{selectedEmployee.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Department</span><span className="text-white">{selectedEmployee.department}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Position</span><span className="text-white">{selectedEmployee.position}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><Badge variant={getStatusColor(selectedEmployee.status)}>{selectedEmployee.status}</Badge></div>
            <div className="flex justify-between"><span className="text-gray-400">Reward Points</span><span className="text-white">{selectedEmployee.rewardPoints}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Bonus</span><span className="text-white">${selectedEmployee.totalBonus || 0}</span></div>
          </div>
        )}
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Employee"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={saveLoading}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saveLoading}>{saveLoading ? 'Saving...' : 'Save'}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
            <Input label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
          </div>
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Department" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
            <Input label="Position" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="on_leave">on_leave</option>
              <option value="terminated">terminated</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Reward Points"
              type="number"
              value={editForm.rewardPoints}
              onChange={(e) => setEditForm({ ...editForm, rewardPoints: e.target.value })}
            />
            <Input
              label="Total Bonus"
              type="number"
              value={editForm.totalBonus}
              onChange={(e) => setEditForm({ ...editForm, totalBonus: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EmployeesManagement
