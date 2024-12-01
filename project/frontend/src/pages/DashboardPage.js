import React, { useState, useEffect } from "react";
import { fetchTransactions, fetchCategories, addTransaction, deleteTransaction, updateTransaction, addCategory, deleteCategory, updateCategory, getData } from "../api";
import { Button } from 'primereact/button';
import Select from 'react-select';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PieChart } from '@mui/x-charts/PieChart';
import "./css/DashboardPage.css";
import CategoryPage from "./CategoryPage";

const DashboardPage = () => {
  const [TformData, setTFormData] = useState({
    amount: '',
    description: '',
    type: 'income',
    category_id: '',
  });
  const [showTModal, setShowTModal] = useState(false); 
  const [showTAddForm, setShowTAddForm] = useState(false);
  const [isEditing, setTIsEditing] = useState(false); 
  const [filteredTransactionsCategory, setFilteredTransactionsCategory] = useState([]);
  const [currentTransactionId, setCurrentTransactionId] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total_sumI, setTotal_sumI] = useState(0);
  const [total_sumE, setTotal_sumE] = useState(0);
  const [i_percent, setI_percent] = useState(0);
  const [e_percent, setE_percent] = useState(0);
  const [DateStartT, setDateStartT] = useState(null);
  const [DateEndT, setDateEndT] = useState(null);
  const [DateStartC, setDateStartC] = useState(null);
  const [DateEndC, setDateEndC] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");
  const [ChartDataI, setChartDataI] = useState([]);
  const [ChartDataE, setChartDataE] = useState([]);
  const [ChartDataT, setChartDataT] = useState([]);
  const [CurrentTCategoryId, setCurrentTCategoryId] = useState(null);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
            UpdateAllState();          
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, []);
  const onItemClick = (
    event, // The mouse event.
    params, // An object that identifies the clicked element.
  ) => {};
  
  const UpdateAllState = async () => {
        const token = localStorage.getItem("token");
        const data = await fetchTransactions(token);
        resetTFormState();
        setTIsEditing(false);
        setShowTModal(false);
        const Data = await getData(token, DateStartC, DateEndC, DateStartT, DateEndT);
        setCategories(Data.categories);
        console.log(categories)
        setTransactions(Data.transactions);
        console.log(transactions)
        setTotal_sumI(Data.total_sum_income);
        setTotal_sumE(Data.total_sum_expense);
        setChartDataI(Data.chart_data_income);
        setChartDataE(Data.chart_data_expense);
        setChartDataT(Data.chart_data_total);
        setI_percent(Data.chart_data_total[0].i_percent);
        setE_percent(Data.chart_data_total[0].e_percent);
        const categoryOptions = Data.categories.map((category) => ({
          value: category.id,
          description: category.description,
          label: category.name,
        }));
        setCategories(categoryOptions);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      try {
        await updateTransaction(currentTransactionId, TformData, token);
        UpdateAllState();
      } catch (error) {
        console.error('Error updating transaction:', error);
        setError('Error updating transaction. Please try again.');
      }
    } else {
      try {
        await addTransaction(TformData, token);
        UpdateAllState();
      } catch (error) {
        console.error('Error adding transaction:', error);
        setError('Error adding transaction. Please try again.');
      }
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(transactionId, token);
      resetTFormState();
      setTIsEditing(false);
      setShowTModal(false);
      UpdateAllState();
    } catch (err) {
      setError('Error deleting transaction. Please try again.');
    }
  };

  const closeModal = () => {
    setShowTModal(false);
    resetTFormState();
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setTFormData((prev) => ({
      ...prev,
      category_id: selectedOption?.value || '',
    }));
  };

  const FetchChartData = async (d) => {
    const clickedItem = ChartDataI[d.dataIndex]; 
    const CategoryId = clickedItem.id;
    setCurrentTCategoryId(CategoryId);
    setFilteredTransactionsCategory(transactions.filter((t) => t.category_id === CategoryId));
  }

  const FetchCatClick = async (id) => {
    console.log(id)
    setCurrentTCategoryId(id);
    setFilteredTransactionsCategory(transactions.filter((t) => t.category_id === id));
  }

  const resetTFormState = () => {
    setTFormData({
      amount: '',
      description: '',
      type: 'income',
      category_id: '',
    });
    setSelectedCategory(null);
    setError('');
    setTIsEditing(false);
    // setShowAddForm(true);
  };

  const handleChange = (e) => {
    setTFormData({
      ...TformData,
      [e.target.name]: e.target.value,
    });
  };



  return (
    
    <div className="dashboard">
      {/* Верхняя зона */}
      {showTModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
              <input
                type="number"
                name="amount"
                value={TformData.amount}
                onChange={handleChange}
                placeholder="Amount"
                required
                className="input-field"
              />
              <input
                type="text"
                name="description"
                value={TformData.description}
                onChange={handleChange}
                placeholder="Description"
                className="input-field"
              />
              <select
                name="type"
                value={TformData.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <Select
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Select Category"
                isClearable
                className="select-field"
              />

              <button type="submit" className="submit-btn">{isEditing ? 'Update Transaction' : 'Add Transaction'}</button><br />
              <dir></dir>
              {isEditing && (
                <button type="button" onClick={() => handleDeleteTransaction(currentTransactionId)} className="submit-btn" style ={{ backgroundColor: '#FF5555' }}>
                  Delete Transaction
                </button>
              )}
            </form>
            <button onClick={closeModal} className="close-btn">Close</button>
          </div>
        </div>
      )}
      <div className="top-row">
        <div className="transactions-table">
          <div className="table-row">
            
            <div className="table-box">
              <button onClick={() => setShowTModal(true)} className="submit-btn">Add Transaction</button>

              <h3>Transactions ( Click to edit )</h3> 
              <DataTable value={transactions} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}  onRowClick = {(e) => {setShowTModal(true); setCurrentTransactionId(e.data.id); setTIsEditing(true); setTFormData(e.data); setSelectedCategory({label: e.data.category_name, value: e.data.category_id});}} tableStyle={{ minWidth: '8rem' }}>
              <Column field="type" header="Type" sortable style={{ color: '#3f51b5', width: '10%'}}></Column>
              <Column field="description" header="Description" sortable style={{ color: '#9c27b0' }}></Column>
              <Column field="category_name" header="Category" sortable style={{ color: '#ff7043', width: '8rem' }}></Column>
              <Column field="amount" header="Amount" sortable style={{ color: '#00897b', width: '6rem' }}></Column>
              <Column field="date" header="Updated" sortable style={{ color: '#6a5acd' }}></Column>
              <Column field="created_at" header="Created" sortable style={{ color: '#9e9e9e' }}></Column>
              </DataTable>
            </div>
        </div>
 


        </div>
        <div className="chart-zone">
          <div className="table-container">
            <div className="table-row">
              <div className="table-box">
                <h3>Income</h3>
                <DataTable value={ChartDataI} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '18rem' }}>
                  <Column field="category" header="Name" sortable></Column>
                  <Column field="total_amount_income" header="Sum" sortable></Column>
                  <Column field="share" header="Percent" sortable></Column>
                </DataTable>
              </div>

              <div className="table-box">
                <h3>Expense</h3>
                <DataTable value={ChartDataE} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '18rem' }}>
                  <Column field="category" header="Name" sortable></Column>
                  <Column field="total_amount_expense" header="Sum" sortable></Column>
                  <Column field="share" header="Percent" sortable></Column>
                </DataTable>
              </div>
            </div>
        <br/>
          <div className="table-row">
            <div className="table-box">
              <h3>Income</h3>
              <PieChart
                  series={[
                    {
                      data: ChartDataI.map((item) => 
                        ({ id: item.id, value: item.total_amount_income > 0 ? item.total_amount_income : 0.00001 , label: item.category })),
                    },
                  ]}
                  onItemClick={(event, d) => FetchChartData(d)}

                  width={400}
                  height={200}
                />
            </div>
            <div className="table-box">
              <h3>Expense</h3>
              <PieChart
                  series={[
                    {
                      data: ChartDataE.map((item) => ({ id: item.id, value:  item.total_amount_expense > 0 ? item.total_amount_expense : 0.00001, label: item.category })),
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  onItemClick={(event, d) => FetchChartData(d)}

                  width={400}
                  height={200}
                />
            </div>
          </div>
          <br/>
    <div className = "table-row">
    <div className="table-box">
      <h3>Total</h3>
      <DataTable value={ChartDataT} tableStyle={{ minWidth: '8rem' }}>
        <Column field="total_income" header="Sum (Income)" ></Column>
        <Column field="i_percent" header="Percent (Income)" ></Column>
        <Column field="total_expense" header="Sum (Expense)" ></Column>
        <Column field="e_percent" header="Percent (Expense)" ></Column>
        <Column field="total" header="Total" ></Column>
      </DataTable>
      <br/><br/>
      <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: total_sumI, label: `Income ${i_percent}%` },
                        { id: 1, value: total_sumE, label:`Expense ${e_percent}%` },
                      ],
                      outerRadius: 70,
                      paddingAngle: 1,
                      cornerRadius: 0,
                      
                    },
                  ]

                }
                width={400}
                height={200}
                />
      </div>
      </div>
    </div>

  </div>
</div>

      </div>

      {/* Нижняя зона */}
      <div className="bottom-row">
        <div className="categories-table">
          <div className="table-container" style = {{ height: "100%", maxHeight: "100%"}}>
            <div className="table-row">
              <div className="table-box" style = {{ overflow: "hidden", scrollbarWidth: "none"}}>
              <button onClick={() => setShowTModal(true)} className="submit-btn">Add Categories</button>

                <h3>Categories ( Click on the name to view transactions ) </h3>
                <DataTable value={categories} paginator rows={3} rowsPerPageOptions={[3, 5, 10, 25, 50]} tableStyle={{ minWidth: '8rem' }} onRowClick = {(e) => {FetchCatClick(e.data.value)}}>
                  <Column field="label" header="Name" sortable style={{ color: '#3f51b5'}}></Column>
                  <Column field="description" header="Description" sortable style={{ color: '#9c27b0' }}></Column>
                  </DataTable>
              </div>
            </div>
          </div>
        </div>
        <div className="category-transactions-table">
          <div className="table-container" style = {{ height: "100%", maxHeight: "100%", overflow: "hidden", scrollbarWidth: "none"}}>
            <div className="table-row">
              <div className="table-box" style = {{ overflow: "hidden", scrollbarWidth: "none"}}>
              <h3>Transactions for Selected Category</h3>
                <DataTable value={filteredTransactionsCategory} paginator rows={3} rowsPerPageOptions={[3, 5, 10, 25, 50]}  onRowClick = {(e) => {setShowTModal(true); setCurrentTransactionId(e.data.id); setTIsEditing(true); setTFormData(e.data); setSelectedCategory({label: e.data.category_name, value: e.data.category_id});}} tableStyle={{ minWidth: '8rem' }}>
                    <Column field="type" header="Type" sortable style={{ color: '#3f51b5', width: '10%'}}></Column>
                    <Column field="description" header="Description" sortable style={{ color: '#9c27b0' }}></Column>
                    <Column field="category_name" header="Category" sortable style={{ color: '#ff7043', width: '8rem' }}></Column>
                    <Column field="amount" header="Amount" sortable style={{ color: '#00897b', width: '6rem' }}></Column>
                    <Column field="date" header="Updated" sortable style={{ color: '#6a5acd' }}></Column>
                    <Column field="created_at" header="Created" sortable style={{ color: '#9e9e9e' }}></Column>
                  </DataTable> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
