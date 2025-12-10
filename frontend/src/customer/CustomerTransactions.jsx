import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/customer/login");
      return;
    }

    fetchTransactions(token);
  }, [navigate]);

  const fetchTransactions = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/customer-portal/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response?.status === 401) {
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <CustomerLayout currentPage="transactions">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="transactions">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search by description or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
            Transaction History
          </h2>

          {filteredTransactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>
              No transactions found
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Debit</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.95rem' }}>
                        {new Date(transaction.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '1rem', color: '#1f2937', fontSize: '0.95rem', fontWeight: '500' }}>
                        {transaction.description || 'NONE'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444', fontWeight: '600', fontSize: '1rem' }}>
                        {transaction.type === 'debit' ? `₹${transaction.amount.toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: '600', fontSize: '1rem' }}>
                        {transaction.type === 'credit' ? `₹${transaction.amount.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerTransactions;
