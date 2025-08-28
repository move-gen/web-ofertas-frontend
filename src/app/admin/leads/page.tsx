"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Car,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  carId?: number;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carLicensePlate?: string;
  carStockNumber?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  walcuLeadId?: string;
  walcuStatus: 'pending' | 'sent' | 'failed';
  walcuError?: string;
  createdAt: string;
  car?: {
    id: number;
    make?: string;
    model?: string;
    version?: string;
    year?: number;
    numberplate?: string;
    sku?: string;
    regularPrice?: number;
    images: { url: string }[];
  };
}

interface LeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    statusSummary: Record<string, number>;
  };
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [statusSummary, setStatusSummary] = useState<Record<string, number>>({});

  // Cargar leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter,
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/leads?${params}`);
      const result: LeadsResponse = await response.json();

      if (result.success) {
        setLeads(result.data.leads);
        setPagination(result.data.pagination);
        setStatusSummary(result.data.statusSummary);
      } else {
        setError('Error cargando leads');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar leads al cambiar filtros o página
  useEffect(() => {
    fetchLeads();
  }, [currentPage, statusFilter, search, fetchLeads]);

  // Actualizar estado de Walcu
  const updateWalcuStatus = async (leadId: string, status: string, walcuLeadId?: string, error?: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walcuStatus: status,
          walcuLeadId,
          walcuError: error
        })
      });

      if (response.ok) {
        // Actualizar estado local
        setLeads(prev => prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, walcuStatus: status as 'pending' | 'sent' | 'failed', walcuLeadId, walcuError: error }
            : lead
        ));
        fetchLeads(); // Recargar para actualizar contadores
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  // Eliminar lead
  const deleteLead = async (leadId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lead?')) return;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
        fetchLeads(); // Recargar para actualizar contadores
      }
    } catch (err) {
      console.error('Error eliminando lead:', err);
    }
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Leads
          </h1>
          <p className="text-gray-600">
            Administra todos los leads recibidos y su estado de envío a Walcu CRM
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusSummary.pending || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusSummary.sent || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusSummary.failed || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, coche..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="sent">Enviados</option>
                <option value="failed">Fallidos</option>
              </select>

              <button
                onClick={fetchLeads}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de leads */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Cargando leads...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <XCircle className="w-8 h-8 mx-auto text-red-400 mb-4" />
              <p className="text-red-500">{error}</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-8 h-8 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No se encontraron leads</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehículo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mensaje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado Walcu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        {/* Cliente */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {lead.firstName} {lead.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                              {lead.phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {lead.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Vehículo */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.car ? (
                            <div className="flex items-center">
                              {lead.car.images?.[0] ? (
                                <img
                                  src={lead.car.images[0].url}
                                  alt={`${lead.car.make} ${lead.car.model}`}
                                  className="h-10 w-10 rounded object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                                  <Car className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {lead.car.make} {lead.car.model}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lead.car.year} • {lead.car.numberplate}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {lead.carMake} {lead.carModel}
                              {lead.carYear && ` • ${lead.carYear}`}
                            </div>
                          )}
                        </td>

                        {/* Mensaje */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {lead.message ? (
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="truncate">
                                  {lead.message.length > 50 
                                    ? `${lead.message.substring(0, 50)}...` 
                                    : lead.message
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sin mensaje</span>
                            )}
                          </div>
                        </td>

                        {/* Estado Walcu */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(lead.walcuStatus)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.walcuStatus)}`}>
                              {lead.walcuStatus === 'sent' ? 'Enviado' : 
                               lead.walcuStatus === 'failed' ? 'Fallido' : 'Pendiente'}
                            </span>
                          </div>
                          {lead.walcuLeadId && (
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {lead.walcuLeadId}
                            </div>
                          )}
                          {lead.walcuError && (
                            <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                              {lead.walcuError}
                            </div>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(lead.createdAt)}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                // Marcar como enviado manualmente
                                updateWalcuStatus(lead.id, 'sent', `manual_${Date.now()}`);
                              }}
                              disabled={lead.walcuStatus === 'sent'}
                              className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                              title="Marcar como enviado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                // Marcar como fallido
                                updateWalcuStatus(lead.id, 'failed', undefined, 'Error manual');
                              }}
                              disabled={lead.walcuStatus === 'failed'}
                              className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                              title="Marcar como fallido"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando{' '}
                        <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span>
                        {' '}a{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.limit, pagination.total)}
                        </span>
                        {' '}de{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
