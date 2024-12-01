import React, { useState, useEffect } from "react";
import { fetchTransactions, fetchCategories, addTransaction, deleteTransaction, updateTransaction, addCategory, deleteCategory, updateCategory, getData } from "../api";
import Select from 'react-select';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PieChart } from '@mui/x-charts/PieChart';
import "./css/DashboardPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DashboardPage = () => {
  const [TformData, setTFormData] = useState({
    amount: '',
    description: '',
    type: 'income',
    category_id: '',
  });
  const [CformData, setCFormData] = useState({
    name: '',
    description: '',
  });
  const [showTModal, setShowTModal] = useState(false); 
  const [showTAddForm, setShowTAddForm] = useState(false);
  const [isEditing, setTIsEditing] = useState(false); 
  const [isEditingC, setCIsEditing] = useState(false);
  const [filteredTransactionsCategory, setFilteredTransactionsCategory] = useState([]);
  const [currentTransactionId, setCurrentTransactionId] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total_sumI, setTotal_sumI] = useState(0);
  const [total_sumE, setTotal_sumE] = useState(0);
  const [i_percent, setI_percent] = useState(0);
  const [e_percent, setE_percent] = useState(0);
  const [DateStartT, setDateStartT] = useState(null);
  const [DateEndT, setDateEndT] = useState(null);
  const [DateStartC, setDateStartC] = useState(null);
  const [DateEndC, setDateEndC] = useState(null);
  const [startDateСNone, setStartDateСNone] = useState(false); // Флаг для "None"
  const [endDateСNone, setEndDateСNone] = useState(false); // Флаг для "None"
  const [startDateTNone, setStartDateTNone] = useState(false); // Флаг для "None"
  const [endDateTNone, setEndDateTNone] = useState(false); // Флаг для "None"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryT, setSelectedCategoryT] = useState({ value: null, label: 'All' });
  const [error, setError] = useState("");
  const [totalTrData, setTotalTrData] = useState([]);
  const [totalTr_SumE, setTotalTr_SumE] = useState(0);
  const [totalTr_SumI, setTotalTr_SumI] = useState(0);
  const [totalTr_percent_I, setTotalTr_percent_I] = useState(0); 
  const [totalTr_percent_E, setTotalTr_percent_E] = useState(0); 
  const [ChartDataI, setChartDataI] = useState([]);
  const [ChartDataE, setChartDataE] = useState([]);
  const [ChartDataT, setChartDataT] = useState([]);
  const [showModalC, setShowModalC] = useState(false);
  const [CategoryId, setCategoryId] = useState(null);
  const [currentCategoryId, setCurrentTCategoryId] = useState(null);
  const [currentCategoryName, setCurrentCategoryName] = useState(null);
  const [filterVisibleС, setFilterVisibleС] = useState(false);
  const [filterVisibleT, setFilterVisibleT] = useState(false);
  const [TransactionsToViewT, setTransactionsToViewT] = useState([]);

  const [tfilterType, setTFilterType] = useState({ value: null, label: 'All' });


  const [cFilterType, setCFilterType] = useState('None');
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
  }, [DateStartC, DateEndC, DateStartT, DateEndT, cFilterType, selectedCategoryT, tfilterType]);

  const UpdateAllState = async () => {
        const token = localStorage.getItem("token");
        const data = await fetchTransactions(token);
        resetTFormState();
        setTIsEditing(false);
        setCIsEditing(false);
        setShowTModal(false);
        const Data = await getData(token, DateStartC, DateEndC, DateStartT, DateEndT);
        setCategories(Data.categories);
        setTransactions(Data.transactions);
        setTotal_sumI(Data.total_sum_income);
        setTotal_sumE(Data.total_sum_expense);
        setChartDataI(Data.chart_data_income);
        setChartDataE(Data.chart_data_expense);
        setChartDataT(Data.chart_data_total);
        setI_percent(Data.chart_data_total[0].i_percent);
        setE_percent(Data.chart_data_total[0].e_percent);
        setTotalTr_SumE(Data.total_tr_data[0].total_tr_expense);
        setTotalTr_SumI(Data.total_tr_data[0].total_tr_income);
        setTotalTr_percent_I(Data.total_tr_data[0].total_tr_i_percent);
        setTotalTr_percent_E(Data.total_tr_data[0].total_tr_e_percent);
        setTotalTrData(Data.total_tr_data);
        setAllTransactions(Data.all_transactions);

        const filteredTransactionsC = Data.transactions.filter((transaction) =>
            selectedCategoryT.value === null || transaction.category_id === selectedCategoryT.value,
        );

        const filteredTransactionsT = filteredTransactionsC.filter((transaction) =>
            tfilterType.value === null || transaction.type === tfilterType.value,
        );

        setTransactionsToViewT(filteredTransactionsT);

        const categoryOptions = Data.categories.map((category) => ({
          value: category.id,
          description: category.description,
          label: category.name,
        }));
        setCategories(categoryOptions);
  }

  const handleSubmitC = async (e) => {
    e.preventDefault();
    if (isEditingC) {
      try {
        await updateCategory(currentCategoryId, CformData, token);
        UpdateAllState();
        closeModalC();
      }
      catch (error) {
        console.error('Error updating category:', error);
      }
    }
    else {
      try {
        await addCategory(CformData, token);
        UpdateAllState();
        closeModalC();
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  }
    const handleDeleteCategory = async (categoryId) => {
      try {
        await deleteCategory(categoryId, token);
        UpdateAllState();
        closeModalC();
        if (currentCategoryId === categoryId) {
          setCurrentTCategoryId(null);
          setFilteredTransactionsCategory([]);
        }

      } catch (error) {
        setError('Failed to delete category. Please try again.');
      }
    };


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
      setFilteredTransactionsCategory(filteredTransactionsCategory.filter((t) => t.id !== transactionId));
    } catch (err) {
      setError('Error deleting transaction. Please try again.');
    }
  };

  const handleFilterClick = () => {
    setFilterVisibleС((prev) => !prev); // Переключаем видимость
  };

  const handleFilterClickT = () => {
    setFilterVisibleT((prev) => !prev); // Переключаем видимость
  };

  const closeModal = () => {
    setShowTModal(false);
    resetTFormState();
  };

  const closeModalC = () => {
    setShowModalC(false);
    resetCFormState();
  }

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setTFormData((prev) => ({
      ...prev,
      category_id: selectedOption?.value || '',
    }));
  };

  const handleCategoryChangeT = (selectedOption) => {
    if (selectedOption === null) {selectedOption = {value: null, label: 'All'}; setSelectedCategoryT(selectedOption);}
    if (!(selectedOption.value === null)) {
        setSelectedCategoryT(selectedOption);
        UpdateAllState();    
    }
  };

  const handleTypeChangeT = (selectedOption) => {
    if (selectedOption === null) {selectedOption = {value: null, label: 'All'}; setTFilterType(selectedOption);}
    if (!(selectedOption.value === null)) {
        setTFilterType(selectedOption);
        UpdateAllState();    
    }
  };

  const FetchChartData = async (d, type) => {
    const clickedItem = ChartDataI[d.dataIndex]; 
    const CategoryId = clickedItem.id;
    await FetchCatClick(CategoryId, type);
  }

  const FetchCatClick = async (id, type = 'None') => {
    setCurrentTCategoryId(id);
    if (type == "None"){
    setCurrentCategoryName(categories.find((c) => c.value === id).label);
    setFilteredTransactionsCategory(allTransactions.filter((t) => t.category_id === id));
    setCFilterType('All');
    }
    else if (type == 'income') {
      setCurrentCategoryName(categories.find((c) => c.value === id).label);
      setFilteredTransactionsCategory(allTransactions.filter((t) => t.category_id === id && t.type === 'income'));
      setCFilterType('Income');
    }
    else if (type == 'expense') {
      setCurrentCategoryName(categories.find((c) => c.value === id).label);
      setFilteredTransactionsCategory(allTransactions.filter((t) => t.category_id === id && t.type === 'expense'));
      setCFilterType('Expense');
    }
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
  const resetCFormState = () => {
    setCFormData({
      name: '',
      description: '',
    });
    setError('');
    setCIsEditing(false);
    // setShowAddForm(true);
  };

  const handleDateStartCChange = (date) => {
    setDateStartC(date);
    setStartDateСNone(false);
    if (!(cFilterType === 'All' || cFilterType === 'None')) {
    setFilteredTransactionsCategory(filteredTransactionsCategory.filter((t) => t.date >= date));
    UpdateAllState();
    }
  }

  const clearFiltersT = () => {
    setTransactionsToViewT(transactions);
    setStartDateTNone(true);
    setEndDateTNone(true);
    setDateStartT(null);
    setDateEndT(null);
    setTFilterType({value: null, label: 'All'});
    setSelectedCategoryT({value: null, label: 'All'});
    UpdateAllState();
  }

  const clearDateC = () => {
    setDateStartC(null);
    setDateEndC(null);
    setStartDateСNone(true);
    setEndDateСNone(true);
    UpdateAllState();
  }

  const handleDateEndCChange = (date) => {
    setDateEndC(date);
    setEndDateСNone(false);
    if (!(cFilterType === 'All' || cFilterType === 'None')) {
      setFilteredTransactionsCategory(filteredTransactionsCategory.filter((t) => t.date >= date));
      UpdateAllState();
    }
  }

  const handleDateStartTChange = (date) => {
    setDateStartT(date);
    setStartDateTNone(false);
    setTransactionsToViewT(transactions.filter((t) => t.date >= date));
    UpdateAllState();
  }

  const handleDateEndTChange = (date) => {
    setDateEndT(date);
    setEndDateTNone(false);
    setTransactionsToViewT(transactions.filter((t) => t.date >= date));
    UpdateAllState();
  }

  const handleChange = (e) => {
    setTFormData({
      ...TformData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeC = (e) => {
    setCFormData({
      ...CformData,
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

    {showModalC && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{isEditingC ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSubmitC} className="transaction-form">
                <input
                  type="text"
                  name="name"
                  value={CformData.name}
                  onChange={handleChangeC}
                  placeholder="Name"
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  name="description"
                  value={CformData.description}
                  onChange={handleChangeC}
                  placeholder="Description"
                  className="input-field"
                />
                
      

                <button type="submit" className="submit-btn">{isEditingC ? 'Update Category' : 'Add Category'}</button><br />
                <dir></dir>
                {isEditingC && (
                  <button type="button" onClick={() => handleDeleteCategory(CategoryId)} className="submit-btn" style ={{ backgroundColor: '#FF5555' }}>
                    Delete Transaction
                  </button>
                )}
              </form>
              <button onClick={closeModalC} className="close-btn">Close</button>
            </div>
          </div>
      )}
      <div className="top-row">
        
        <div className="transactions-table" style={{ flex: "1.4 1 0%", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="table-container">
          <div 
                className="table-row" 
                style={{
                  display: 'flex', 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  width: '100%', 
                  height: 'auto', 
                  overflow: 'auto',
                  boxSizing: 'border-box' // Важное свойство для корректного расчета размеров
                }}
              >             
              <div className="table-box">
              <button onClick={handleFilterClickT} className="submit-btn">
              {filterVisibleT ? "Hide Filters" : "Show Filters"}
              </button>
              {filterVisibleT && (
                  <div style={{ width: "100%" }}>
                  <h3>Date</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", width: "48%" }}>
                      <label>From:</label>
                      <select
                        value={startDateTNone ? "none" : "date"}
                        onChange={(e) => {
                          if (e.target.value === "none") {
                            setStartDateTNone(true);
                            setDateStartT(null);
                          } else {
                            setStartDateTNone(false);
                          }
                        }}
                        className="input-field"
                        style={{ width: "100%" }}
                      >
                        <option value="date">Choose Date</option>
                        <option value="none">None</option>
                      </select>
                      {!startDateTNone && (
                        <DatePicker
                          selected={DateStartT}
                          onChange={handleDateStartTChange}
                          className="input-field"
                          placeholderText="Select start date"
                          dateFormat="yyyy-MM-dd"
                          style={{ width: "100%" }}
                        />
                      )}
                    </div>
                
                    <div style={{ display: "flex", flexDirection: "column", width: "48%" }}>
                      <label>To:</label>
                      <select
                        value={endDateTNone ? "none" : "date"}
                        onChange={(e) => {
                          if (e.target.value === "none") {
                            setEndDateTNone(true);
                            setDateEndT(null);
                          } else {
                            setEndDateTNone(false);
                          }
                        }}
                        className="input-field"
                        style={{ width: "100%" }}
                      >
                        <option value="date">Choose Date</option>
                        <option value="none">None</option>
                      </select>
                      {!endDateTNone && (
                        <DatePicker
                          selected={DateEndT}
                          onChange={handleDateEndTChange}
                          className="input-field"
                          placeholderText="Select end date"
                          dateFormat="yyyy-MM-dd"
                          style={{ width: "100%" }}
                        />
                      )}
                    </div>
                  </div>
                  <h3> Category </h3>
                  <Select
                  options={categories}
                  value={selectedCategoryT}
                  onChange={handleCategoryChangeT}
                  placeholder="Select Category"
                  isClearable
                  className="select-field"
                  menuPortalTarget={document.body} // Рендерить меню в body
                  menuPosition="fixed" // Использовать фиксированное позиционирование
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Установить высокий z-index
                  }}
                />
                <h3> Type </h3>
                <Select
                  options={[{ label: "Income", value: 'income' }, { label: "Expense", value: 'expense' }]}
                  value={tfilterType}
                  onChange={handleTypeChangeT}
                  placeholder="Select Category"
                  isClearable
                  className="select-field"
                  menuPortalTarget={document.body} // Рендерить меню в body
                  menuPosition="fixed" // Использовать фиксированное позиционирование
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Установить высокий z-index
                  }}
                />
                  <div>
                    <br />
                    <button onClick={() => clearFiltersT(true)} className="submit-btn" style = {{background: "#d95c8c"}}>Clear</button>
                  </div>   
                </div>   

              )}
              </div>
            </div>
          </div>
          <div className="table-container" style = {{ height: "75%", maxHeight: "100%"}}>
            <div className="table-row" >
              <div className="table-box" style = {{ overflow: "auto", scrollbarWidth: "none", height: "100%", maxHeight: "95%"}}>
                <button onClick={() => setShowTModal(true)} className="submit-btn">Add Transaction</button>

                <h3>Transactions ( Click to edit )</h3> 
                <DataTable value={TransactionsToViewT} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}  onRowClick = {(e) => {setShowTModal(true); setCurrentTransactionId(e.data.id); setTIsEditing(true); setTFormData(e.data); setSelectedCategory({label: e.data.category_name, value: e.data.category_id});}} tableStyle={{ minWidth: '8rem' }}>
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
          <div className="table-container" style = {{ height: "100%", maxHeight: "25%"}}>
            <div className="table-row" style = {{ overflow: "auto", scrollbarWidth: "none", maxHeight: "100%"}}>
              <div className="table-box" style = {{ overflow: "auto", scrollbarWidth: "none", maxHeight: "90%"}}>
                <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center '}}>
                  <DataTable value={totalTrData} tableStyle={{ minWidth: '8rem' }}>
                    <Column field="total_tr_income" header="Sum (Income)" ></Column>
                    <Column field="total_tr_i_percent" header="Percent (Income)" ></Column>
                    <Column field="total_tr_expense" header="Sum (Expense)" ></Column>
                    <Column field="total_tr_e_percent" header="Percent (Expense)" ></Column>
                    <Column field="total_tr" header="Total" ></Column>
                  </DataTable>
                  <br/><br/>
                  <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center '}}>
                    <PieChart
                          series={[
                            {
                              data: [
                                { id: 0, value: totalTr_SumI, label: `Income ${totalTr_percent_I}%` },
                                { id: 1, value: totalTr_SumE, label:`Expense ${totalTr_percent_E}%` },
                              ],
                              outerRadius: 70,
                              paddingAngle: 1,
                              cornerRadius: 0,
                              highlightScope: { fade: 'global', highlight: 'item' },
                              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                              
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
        <div className="chart-zone" >
          <div className = "table-container" style = {{ height: "auto", maxHeight: "auto"}}>
            <div className="table-row" style={{
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%', 
                height: 'auto', 
                overflow: 'auto',
                boxSizing: 'border-box' // Важное свойство для корректного расчета размеров
              }}>
             <div className="table-box">
              <button onClick={handleFilterClick} className="submit-btn" >
              {filterVisibleС ? "Hide Filters" : "Show Filters"}
              </button>
              {filterVisibleС && (
                  <div style={{ width: "100%" }}>
                  <h3>Date</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", width: "48%" }}>
                      <label>From:</label>
                      <select
                        value={startDateСNone ? "none" : "date"}
                        onChange={(e) => {
                          if (e.target.value === "none") {
                            setStartDateСNone(true);
                            setDateStartC(null);
                          } else {
                            setStartDateСNone(false);
                          }
                        }}
                        className="input-field"
                        style={{ width: "100%" }}
                      >
                        <option value="date">Choose Date</option>
                        <option value="none">None</option>
                      </select>
                      {!startDateСNone && (
                        <DatePicker
                          selected={DateStartC}
                          onChange={handleDateStartCChange}
                          className="input-field"
                          placeholderText="Select start date"
                          dateFormat="yyyy-MM-dd"
                          style={{ width: "100%" }}
                        />
                      )}
                    </div>
                
                    <div style={{ display: "flex", flexDirection: "column", width: "48%" }}>
                      <label>To:</label>
                      <select
                        value={endDateСNone ? "none" : "date"}
                        onChange={(e) => {
                          if (e.target.value === "none") {
                            setEndDateСNone(true);
                            setDateEndC(null);
                          } else {
                            setEndDateСNone(false);
                          }
                        }}
                        className="input-field"
                        style={{ width: "100%" }}
                      >
                        <option value="date">Choose Date</option>
                        <option value="none">None</option>
                      </select>
                      {!endDateСNone && (
                        <DatePicker
                          selected={DateEndC}
                          onChange={handleDateEndCChange}
                          className="input-field"
                          placeholderText="Select end date"
                          dateFormat="yyyy-MM-dd"
                          style={{ width: "100%" }}
                        />
                      )}
                    </div>
                  </div>
                  <button onClick={() => clearDateC(true)} className="submit-btn" style = {{background: "#d95c8c"}}>Clear</button>

                </div>                
              )}
              </div>
            </div>
          </div>
          <div><br/></div>
          <div className="table-container">
            <div className="table-row">
              <div className="table-box">
                <h3>Income</h3>
                <DataTable value={ChartDataI} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '18rem' }} onRowDoubleClick = {(e) => {setShowModalC(true); setCIsEditing(true); setCategoryId(e.data.id); setCFormData({name: e.data.category, description: e.data.description})}} onRowClick = {(e) => { FetchCatClick(e.data.id, 'income')}} >
                  <Column field="category" header="Name" sortable style = {{color: "#B8336A"}}></Column>
                  <Column field="total_amount_income" header="Sum" sortable style = {{color: "#9B4F75 "}}></Column>
                  <Column field="share" header="Percent" sortable style = {{color: "#d95c8c"}}></Column>
                </DataTable>
              </div>

              <div className="table-box">
                <h3>Expense</h3>
                <DataTable value={ChartDataE} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '18rem' }} onRowDoubleClick = {(e) => {setShowModalC(true); setCIsEditing(true); setCategoryId(e.data.id); setCFormData({name: e.data.category, description: e.data.description})}} onRowClick = {(e) => { FetchCatClick(e.data.id, 'expense')}} >
                  <Column field="category" header="Name" sortable style = {{color: "#B8336A"}}></Column>
                  <Column field="total_amount_expense" header="Sum" sortable style = {{color: "#9B4F75 "}}></Column>
                  <Column field="share" header="Percent" sortable style = {{color: "#d95c8c"}}></Column>
                </DataTable>
              </div>
            </div>
        <br/>
          <div className="table-row">
            <div className="table-box">
              <h3>Income</h3>
              <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <PieChart
                    series={[
                      {
                        data: ChartDataI.map((item) => 
                          ({ id: item.id, value: item.total_amount_income > 0 ? item.total_amount_income  : 0.00001 , label: item.category + ` ${item.share > 0 ? item.share : 0.00001 }%` })),
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                      },
                    ]}
                    onItemClick={(event, d) => FetchChartData(d, 'income')}
                    slotProps={{
                      legend: {
                        hidden : true,
                        onItemClick: (event, d) => FetchChartData(d, 'income'),
                      }
                    }}
                    width={400}
                    height={200}
                  />
              </div>
            </div>
              <div className="table-box">
                <h3>Expense</h3>
                
                <div style = {{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <PieChart
                    series={[
                      {
                        data: ChartDataE.map((item) => ({ id: item.id, value:  item.total_amount_expense > 0 ? item.total_amount_expense : 0.00001, label: item.category + ` ${item.share > 0 ? item.share : 0.00001 }%` })), 
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                      },
                    ]}
                    onItemClick={(event, d) => FetchChartData(d, 'expense')}
                    slotProps={{
                      legend: {
                        hidden : true,
                        onItemClick: (event, d) => FetchChartData(d, 'expense'),
                      }
                    }}
                    width={400}
                    height={200}
                  />
                </div>
            </div>

          </div>
          <br/>
          <div className = 'table-container' >
              <div className = "table-row" >
                <div className="table-box" >
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
                                highlightScope: { fade: 'global', highlight: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                
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
      </div>

      {/* Нижняя зона */}
      <div className="bottom-row" >
        <div className="categories-table">
          <div className="table-container" style = {{ height: "100%", maxHeight: "100%", overflow: "hidden", scrollbarWidth: "none"}}>
            <div className="table-row" style = {{ height: "100%", maxHeight: "100%", overflow: "hidden", scrollbarWidth: "none"}}>
              <div className="table-box" style = {{ overflow: "hidden", scrollbarWidth: "none", height: "89%", maxHeight: "100%"}}>
              <button onClick={() => setShowModalC(true)} className="submit-btn">Add Categories</button>

                <h3>Categories ( Click on the name to view transactions (Double Click to edit)) </h3>
                <DataTable value={categories} paginator rows={3} rowsPerPageOptions={[3, 5, 10, 25, 50]} tableStyle={{ minWidth: '8rem' }} onRowDoubleClick = {(e) => {setShowModalC(true); setCIsEditing(true); setCategoryId(e.data.value); setCFormData({name: e.data.label, description: e.data.description})}} onRowClick = {(e) => {FetchCatClick(e.data.value)} }>
                  <Column field="label" header="Name" sortable style={{ color: '#3f51b5'}}></Column>
                  <Column field="description" header="Description" sortable style={{ color: '#9c27b0' }}></Column>
                  </DataTable>
              </div>
            </div>
          </div>
        </div>
        <div className="category-transactions-table">
          <div className="table-container" style = {{ height: "100%", maxHeight: "100%", overflow: "hidden", scrollbarWidth: "none"}}>
            <div className="table-row" style = {{ height: "100%", maxHeight: "100%", overflow: "hidden", scrollbarWidth: "none"}}>
              <div className="table-box" style = {{ overflow: "auto", scrollbarWidth: "none", height: "89%", maxHeight: "90%"}}>
              <button onClick={() => {setFilteredTransactionsCategory([]); setCurrentCategoryName(null); setCFilterType('None');}} className="submit-btn">Clear</button>
              <h3>Transactions for Selected Category: {currentCategoryName === null ? 'None' : currentCategoryName}, Displaying: {cFilterType}</h3>
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
