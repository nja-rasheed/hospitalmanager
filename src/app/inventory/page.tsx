'use client';

import React, { useState } from 'react';
import { useInventory } from '../../hooks/useHospitalData';
import { Button, Input, Card, Select } from '../../components/UI';
import { Table } from '../../components/Table';
import { Modal, Alert } from '../../components/Modal';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import RoleGuard from '../../components/RoleGuard';

export default function InventoryPage() {
  const { inventory, loading, addInventoryItem, updateStock } = useInventory();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add form states
  const [itemName, setItemName] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [unit, setUnit] = useState('');

  // Update form states
  const [newStock, setNewStock] = useState('');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !initialStock || !expiryDate || !unit) {
      setAlert({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    const result = await addInventoryItem({
      name: itemName,
      stock: parseInt(initialStock),
      expiry_date: expiryDate,
      unit
    });

    if (result) {
      setAlert({ type: 'success', message: 'Item added successfully' });
      setItemName('');
      setInitialStock('');
      setExpiryDate('');
      setUnit('');
      setShowAddForm(false);
    } else {
      setAlert({ type: 'error', message: 'Failed to add item' });
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStock || !selectedItem) {
      setAlert({ type: 'error', message: 'Please enter stock quantity' });
      return;
    }

    await updateStock(selectedItem.id, parseInt(newStock));
    setAlert({ type: 'success', message: 'Stock updated successfully' });
    setNewStock('');
    setSelectedItem(null);
    setShowUpdateForm(false);
  };

  const openUpdateForm = (item: any) => {
    setSelectedItem(item);
    setNewStock(item.stock.toString());
    setShowUpdateForm(true);
  };

  // Calculate stats
  const lowStockItems = inventory.filter(item => item.stock < 10);
  const expiringSoon = inventory.filter(item => {
    const expiryDate = new Date(item.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });
  const totalValue = inventory.reduce((sum, item) => sum + item.stock, 0);

  const inventoryColumns = [
    { key: 'name', header: 'Item Name' },
    { key: 'stock', header: 'Stock', render: (value: number, row: any) => (
      <span className={`font-medium ${value < 10 ? 'text-red-600' : 'text-green-600'}`}>
        {value} {row.unit}
      </span>
    )},
    { key: 'unit', header: 'Unit' },
    { 
      key: 'expiry_date', 
      header: 'Expiry', 
      render: (value: string) => {
        const expiryDate = new Date(value);
        const isExpiringSoon = expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <span className={`text-xs sm:text-sm ${isExpiringSoon ? 'text-red-600 font-medium' : ''}`}>
            {expiryDate.toLocaleDateString()}
          </span>
        );
      }
    },
    { key: 'updated_at', header: 'Last Updated', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'actions', header: 'Actions', render: (value: any, row: any) => (
      <RoleGuard allowed={['admin', 'staff']}>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 min-h-[36px]"
            onClick={() => openUpdateForm(row)}
          >
            Update
          </button>
        </div>
      </RoleGuard>
    )}
  ];

  const units = ['tablets', 'bottles', 'boxes', 'vials', 'pieces', 'kg', 'liters'];

  return (
    <DashboardLayout title="Inventory Management">
      <div className="space-y-8">
        {/* Action Button */}
        <div className="flex justify-end">
          <RoleGuard allowed={['admin', 'staff']}>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Add New Item
            </button>
          </RoleGuard>
        </div>

        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Items"
            value={inventory.length}
            icon="📦"
            color="blue"
          />
          <DashboardCard
            title="Low Stock"
            value={lowStockItems.length}
            icon="⚠️"
            color="red"
            subtitle="< 10 units"
          />
          <DashboardCard
            title="Expiring Soon"
            value={expiringSoon.length}
            icon="⏰"
            color="yellow"
            subtitle="Within 30 days"
          />
          <DashboardCard
            title="Total Units"
            value={totalValue}
            icon="📊"
            color="green"
          />
        </div>

        {/* Alert Cards */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">⚠️ Low Stock Alert</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{lowStockItems.length} item(s) have low stock: {lowStockItems.map(item => item.name).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {expiringSoon.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">⏰ Expiry Alert</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{expiringSoon.length} item(s) expiring within 30 days: {expiringSoon.map(item => item.name).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
          </div>
          <div className="overflow-x-auto">
            <Table data={inventory} columns={inventoryColumns} loading={loading} />
          </div>
        </div>

        {/* Add Item Modal */}
        <Modal 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)}
          title="Add New Inventory Item"
        >
          <div className="p-6">
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Select Unit</option>
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Update Stock Modal */}
        <Modal 
          isOpen={showUpdateForm} 
          onClose={() => setShowUpdateForm(false)}
          title={`Update Stock - ${selectedItem?.name}`}
        >
          <div className="p-6">
            <form onSubmit={handleUpdateStock} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Current stock: <span className="font-semibold">{selectedItem?.stock} {selectedItem?.unit}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Stock Quantity *
                </label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter new quantity"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
