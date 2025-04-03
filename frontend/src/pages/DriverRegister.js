import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DriverRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicle: {
      model: '',
      plate: '',
      year: '',
      color: ''
    },
    documents: {
      cnh: '',
      cpf: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Enviando dados:', formData);
      const response = await api.post('/drivers/register', formData);
      console.log('Resposta:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      navigate('/driver/pending');
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error.response?.data?.message || 'Erro ao registrar motorista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cadastro de Motorista
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <input
                type="tel"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Dados do Veículo */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Dados do Veículo</h3>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Modelo do veículo"
                value={formData.vehicle.model}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicle: { ...formData.vehicle, model: e.target.value }
                })}
              />
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Placa"
                value={formData.vehicle.plate}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicle: { ...formData.vehicle, plate: e.target.value }
                })}
              />
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ano"
                value={formData.vehicle.year}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicle: { ...formData.vehicle, year: e.target.value }
                })}
              />
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Cor"
                value={formData.vehicle.color}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicle: { ...formData.vehicle, color: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Documentos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="CNH"
                value={formData.documents.cnh}
                onChange={(e) => setFormData({
                  ...formData,
                  documents: { ...formData.documents, cnh: e.target.value }
                })}
              />
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="CPF"
                value={formData.documents.cpf}
                onChange={(e) => setFormData({
                  ...formData,
                  documents: { ...formData.documents, cpf: e.target.value }
                })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Registrando...' : 'Registrar como Motorista'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center mt-4">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Voltar para registro normal
          </Link>
        </div>
      </div>
    </div>
  );
} 