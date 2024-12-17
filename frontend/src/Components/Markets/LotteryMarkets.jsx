import React, { useEffect, useState } from 'react';
import SingleCard from '../Common/SingleCard';
import Pagination from '../Common/Pagination';
import DearLotteryCard from '../Common/DearLotteryCard';
import { useAppContext } from '../../contextApi/context';
import CustomModal from '../Common/modal';
import {
  generateLotteryTicket,
  getLotteryTickets,
  getSelectSemInModal,
  singleLotteryDelete,
  singleLotteryEdit,
  unPurchasedLotteryTicketsDelete,
} from '../../Utils/apiService';
import strings from '../../Utils/constant/stringConstant';
import { getLotteryMarketsInitialState } from '../../Utils/getInitialState';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO } from 'date-fns';
import './LotteryMarkets.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Oval } from 'react-loader-spinner';
// import DatePicker from 'react-datepicker'; // Make sure you have this imported
// import "react-datepicker/dist/react-datepicker.css"; // Include CSS for styling

const LotteryMarkets = () => {
  const { store, dispatch } = useAppContext();
  console.log('===>>> store', store.admin.accessToken);
  const [state, setState] = useState(getLotteryMarketsInitialState);
  const [hasMore, setHasMore] = useState(true);
  console.log('===>>> random token', state.lotteryId);
  const accessToken = store?.admin?.accessToken;
  console.log('--->>>Access token', accessToken);
  console.log('Search By SEM:', state);
  const allowedDrawTimes = ['10:00 A.M.', '1:00 P.M.', '6:00 P.M.', '8:00 P.M.'];

  // Fetch tickets when the component mounts
  useEffect(() => {
    if (accessToken) {
      fetchLotteryTickets();
    }
  }, [accessToken, state.pagination.page, state.search]);

  // get lottery tickets in the admin panel
  const fetchLotteryTickets = async (currentPage = state.pagination.page) => {
    console.log('Fetching Lottery Tickets for page', currentPage);
    const response = await getLotteryTickets({
      searchBySem: state.search || '',
      page: currentPage,
      limit: state.pagination.limit || 10,
      totalPages: state.pagination.totalPages || 0,
      totalItems: state.pagination.totalItems || 0,
    });
    if (response) {
      setState((prev) => ({
        ...prev,
        lotteryCards: state.search.length > 0 ? response.data : [...prev.lotteryCards, ...response.data],
      }));
      setHasMore(currentPage < (response.pagination?.totalPages || 0));

      dispatch({
        type: strings.FETCH_LOTTERY_TICKETS,
        payload: response.data,
      });
    } else {
      console.error('Failed to fetch tickets');
      setHasMore(false);
    }
  };
  console.log('data===>', state);

  // Function to fetch more data when user scrolls
  const fetchMoreData = () => {
    if (hasMore) {
      setState((prevState) => ({
        ...prevState,
        pagination: {
          ...prevState.pagination,
          page: prevState.pagination.page + 1,
        },
      }));
    }
  };
  const handlePageChange = (newPage) => {
    setState((prev) => ({
      ...prev,

      pagination: {
        ...prev.pagination,
        page: newPage,
      },
    }));
  };

  const handleOpenModal = () => setState((prev) => ({ ...prev, showTicketModal: false, showModal: true }));

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      showModal: false,
      showTicketModal: false,
      isModalOpen: false,
      inputs: getLotteryMarketsInitialState().inputs, // Reset inputs when closing
    }));
  };

  const handleDateChange = (date) => {
    const formattedDate = formatISO(date); // Format date as ISO string
    handleInputChange('DateTime', formattedDate);
  };

  //GET api to generate the ticket number as by sem values from dropdown
  async function handleGenerateTicketNumber(selectedValue) {
    const response = await getSelectSemInModal(selectedValue);
    console.log('===>> get api response', response);

    if (response && response.success) {
      setState((prev) => ({
        ...prev,
        inputs: { ...prev.inputs, tickets: response.data.tickets },
        showTicketModal: true, // Show the modal when tickets are fetched
      }));
    } else {
      console.error('Failed to fetch ticket numbers');
    }
  }

  // post Api to generate lottery tickets with the provided fields
  async function handleCreateTicket() {
    if (state.inputs.sem > 0) {
      const response = await generateLotteryTicket({
        name: state.inputs.name,
        // date: state.inputs.DateTime,
        drawDate: state.inputs.drawDate, // Updated to use drawDate
        drawTime: state.inputs.drawTime, // Updated to use drawTime
        firstPrize: state.inputs.firstPrize,
        sem: state.inputs.sem,
        price: state.inputs.price,
      });

      if (response) {
        // Dispatch to global state
        dispatch({
          type: strings.GENERATE_LOTTERY,
          payload: response.data, // assuming response.data contains the created ticket info
        });

        handleCloseModal();
        setState((prev) => ({ ...prev, randomToken: '' }));
        fetchLotteryTickets();
      } else {
        console.error('Failed to create ticket');
      }
    }
  }

  const handleInputChange = (field, value) => {
    setState((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [field]: value,
      },
    }));
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = async () => {
    const response = await unPurchasedLotteryTicketsDelete(true);
    if (response) {
      // Update state to close the delete modal
      setState((prev) => ({
        ...prev,
        showDeleteModal: false, // Close the delete modal
      }));
      fetchLotteryTickets(); // Refresh tickets after deletion
    } else {
      console.error('Failed to delete all lotteries');
    }
  };

  //seperately for each single lottery card
  const handleEdit = async (lotteryId) => {
    console.log('====>>> onclick id', lotteryId);

    const lotteryToEdit = state.lotteryCards.find((card) => card.lotteryId === lotteryId);

    // Update the inputs state with the current lottery data
    setState((prev) => ({
      ...prev,
      inputs: {
        id: lotteryToEdit.lotteryId,
        name: lotteryToEdit.name,
        DateTime: lotteryToEdit.date,
        firstPrize: lotteryToEdit.firstPrize,
        sem: lotteryToEdit.sem,
        price: lotteryToEdit.price,
        tickets: lotteryToEdit.ticketNumbers || [], // Assuming ticket numbers are available
      },
      isModalOpen: true, // Open the modal
    }));
  };

  const handleSave = async () => {
    const { id, name, DateTime, firstPrize, sem, price } = state.inputs;
    const response = await singleLotteryEdit({
      lotteryId: id,
      name: name,
      date: DateTime,
      firstPrize: firstPrize,
      price: price,
    });
    console.log('====>>> response from the edit api', response);
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    const response = await singleLotteryDelete(id);

    if (response) {
      console.log('Delete successful:', response);
      fetchLotteryTickets();
    } else {
      console.log('Error deleting the card');
    }
  };

  return (
    <div
      className="bg-white"
      style={{
        minHeight: '100vh',
        // width:"100",
        margin: '0 auto', // Center the div horizontally
        overflowX: 'hidden', // Ensure no horizontal overflow
      }}
    >
      <div
        className="card text-center mt-2 mr-5 ml-5"
        style={{
          backgroundColor: '#e6f7ff',
          position: 'relative',
        }}
      >
        <SingleCard
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <div className="card-header-pill text-bold d-flex align-items-center justify-content-between">
            {/* Left side: Search Input */}
            <div className="flex-fill d-flex align-items-center" style={{ flexBasis: '33%' }}>
              <input
                type="text"
                placeholder="Search Lottery Tickets by SEM"
                value={state.search}
                onChange={async (e) => {
                  const searchValue = e.target.value;
                  setState((prevState) => ({
                    ...prevState,
                    search: searchValue, // Update search term in state
                  }));
                  await fetchLotteryTickets(1); // Fetch tickets with search
                }}
                style={{
                  padding: '5px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  marginRight: '15px',
                  width: '100%', // Adjust width to occupy available space
                }}
              />
            </div>

            {/* Middle section: Generate Ticket Number */}
            <div className="flex-fill d-flex align-items-center justify-content-center" style={{ flexBasis: '33%' }}>
              <span
                style={{
                  color: '#4682B4',
                  fontWeight: 'bold',
                }}
              >
                Generate Ticket Number To Create Lottery Ticket By SEM
              </span>
              <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                <select
                  value={state.inputs.sem || ''}
                  style={{
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f1f1f1',
                    cursor: 'pointer',
                  }}
                  onChange={async (e) => {
                    const selectedValue = e.target.value;
                    console.log('Selected Value:', selectedValue);
                    await handleGenerateTicketNumber(selectedValue);
                    setState((prevState) => ({
                      ...prevState,
                      inputs: {
                        ...prevState.inputs,
                        sem: selectedValue, // Set SEM in state
                      },
                    }));
                  }}
                >
                  <option value="" disabled>
                    Select SEM
                  </option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
            </div>

            {/* Right side: Delete icon */}
            <div className="flex-fill d-flex align-items-center justify-content-end" style={{ flexBasis: '33%' }}>
              <i
                className="fas fa-trash-alt"
                style={{
                  cursor: 'pointer',
                  fontSize: '2rem',
                  color: '#4682B4',
                }}
                title="Delete all unpurchased lottery tickets"
                onClick={() => setState((prev) => ({ ...prev, showDeleteModal: true }))}
              ></i>
            </div>
          </div>
        </SingleCard>
        <div className="card-body  mt-2 mb-3">
          <SingleCard className="mb-2 p-4">
            <InfiniteScroll
              style={{ overflowX: 'hidden' }}
              dataLength={state.lotteryCards.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={
                // Use the spinner here
                <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                  <Oval
                    height={40}
                    width={40}
                    color="#4fa94d"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel="oval-loading"
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                  />
                </div>
              }
              height={600}
              endMessage={
                !hasMore &&
                state.lotteryCards.length > 0 && <p className="text-center mt-3">You have seen all the tickets!</p>
              }
            >
              <div className="container">
                <div className="row justify-content-center">
                  {state.lotteryCards.length > 0 ? (
                    state.lotteryCards.map((card) => (
                      <div className="col-md-4 mb-4" key={card.id}>
                        <DearLotteryCard
                          lotteryName={card.name}
                          drawDate={new Date(card.date).toLocaleDateString()}
                          drawTime={new Date(card.date).toLocaleTimeString()}
                          firstPrize={card.firstPrize}
                          sem={card.sem}
                          price={card.price}
                          ticketNumbers={card.ticketNumber}
                          onEdit={() => handleEdit(card.lotteryId)}
                          onDelete={() => handleDelete(card.lotteryId)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center mt-5">
                      <img
                        src="https://media.giphy.com/media/jy6UhbChQ5dQ4/giphy.gif"
                        alt="Funny no tickets"
                        style={{ width: '200px' }}
                      />
                      <h4 className="text-warning mt-3">Oops! No Lottery Tickets found!</h4>
                      <p className="text-muted">
                        Seems like the lottery fairy hasn't visited yet. 🧚‍♀️
                        <br />
                        Don’t worry, you can be the magician who creates the first one! 🎩✨
                      </p>
                      {/* <button
                      className="btn btn-primary mt-3"
                      onClick={handleOpenModal}
                      style={{ animation: "shake 0.5s" }}
                    >
                      Create Your Magic Ticket Now!
                    </button> */}
                    </div>
                  )}
                </div>
              </div>
            </InfiniteScroll>
          </SingleCard>
        </div>

        {/* Custom Modal for creating a ticket */}

        <CustomModal
          showModal={state.showModal}
          onClose={handleCloseModal}
          heading="Create Lottery Ticket"
          inputs={[
            {
              id: 'name',
              label: 'Name',
              value: state.inputs.name ?? (state?.lotteryCards ? state?.lotteryCards[0]?.card?.name : ''),
              onChange: (value) => handleInputChange('name', value),
            },
            // {
            //   id: "DateTime",
            //   label: "Date and Time",
            //   component: (
            //     <div className="date-time-picker-container text-center">
            //       <DatePicker
            //         selected={
            //           state.inputs.DateTime
            //             ? new Date(state.inputs.DateTime)
            //             : new Date() // Fallback to current date if DateTime is invalid
            //         }
            //         onChange={handleDateChange}
            //         showTimeSelect
            //         dateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSXXX" // Format as ISO
            //         className="form-control"
            //       />
            //     </div>
            //   ),
            // },
            // {
            //   id: "drawDate",
            //   label: "Draw Date",
            //   component: (
            //     <div className="date-picker-container text-center">
            //       <DatePicker
            //         selected={
            //           state.inputs.drawDate
            //             ? new Date(state.inputs.drawDate)
            //             : new Date() // Fallback to current date if drawDate is invalid
            //         }
            //         onChange={date => setState(prev => ({ ...prev, inputs: { ...prev.inputs, drawDate: date }}))}
            //         dateFormat="yyyy-MM-dd" // Format as needed
            //         className="form-control"
            //       />
            //     </div>
            //   ),
            // },
            {
              id: 'drawDate',
              label: 'Draw Date',
              component: (
                <div className="date-picker-container text-center">
                  <DatePicker
                    selected={state.inputs.drawDate ? new Date(state.inputs.drawDate) : new Date()} // Default to today if no date selected
                    onChange={(date) => {
                      setState((prev) => ({
                        ...prev,
                        inputs: {
                          ...prev.inputs,
                          drawDate: date.toISOString(),
                        }, // Store date in ISO format
                      }));
                    }}
                    minDate={new Date()} // Disable past dates
                    className="form-control"
                    dateFormat="yyyy-MM-dd" // Format date for display
                  />
                </div>
              ),
            },
            {
              id: 'drawTime',
              label: 'Draw Time',
              component: (
                <div className="time-picker-container text-center">
                  <select
                    value={state.inputs.drawTime}
                    onChange={(e) => {
                      setState((prev) => ({
                        ...prev,
                        inputs: { ...prev.inputs, drawTime: e.target.value }, // Store selected time
                      }));
                    }}
                    className="form-control"
                  >
                    <option value="" disabled>
                      Select Draw Time
                    </option>
                    {allowedDrawTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ),
            },

            {
              id: 'firstPrize',
              label: 'First Prize',
              value: state.inputs.firstPrize ?? (state?.lotteryCards ? state?.lotteryCards[0]?.card?.firstPrize : ''),
              onChange: (value) => handleInputChange('firstPrize', value),
            },

            {
              id: 'sem',
              label: 'SEM',
              // component: (
              //   <select
              //     className="form-control"
              //     value={state.inputs.sem}
              //     onChange={(e) => handleSemChange(e.target.value)}
              //   >
              //     <option value="">Select SEM</option>
              //     {[5, 10, 25, 50, 100, 200].map((option) => (
              //       <option key={option} value={option}>
              //         {option}
              //       </option>
              //     ))}
              //   </select>
              // ),

              component: (
                <input
                  className="form-control"
                  value={state.inputs.sem} // Display SEM value from state
                  readOnly
                  style={{
                    backgroundColor: '#e9ecef',
                    cursor: 'not-allowed',
                  }} // Optional: Style to make it look disabled
                />
              ),
            },
            {
              id: 'price',
              label: 'Price',
              value: state.inputs.price,
              onChange: (value) => handleInputChange('price', value),
            },
          ]}
          buttonLabel="Create Ticket"
          onButtonClick={handleCreateTicket}
          textOnly={false} // Ensures inputs are rendered
        />
        <CustomModal
          showModal={state.isModalOpen}
          onClose={handleCloseModal}
          heading="Edit Lottery Details"
          inputs={[
            {
              id: 'name',
              label: 'Lottery Name',
              value: state.inputs.name || '',
              onChange: (value) => handleInputChange('name', value),
            },
            {
              id: 'date',
              label: 'Draw Date',
              value: state.inputs.DateTime || '',
              onChange: (value) => handleInputChange('DateTime', value),
              readOnly: true,
            },
            {
              id: 'firstPrize',
              label: 'First Prize',
              value: state.inputs.firstPrize || '',
              onChange: (value) => handleInputChange('firstPrize', value),
            },
            {
              id: 'sem',
              label: 'SEM',
              value: state.inputs.sem || '',
              onChange: (value) => handleInputChange('sem', value),
              readOnly: true,
            },
            {
              id: 'price',
              label: 'Price',
              value: state.inputs.price || '',
              onChange: (value) => handleInputChange('price', value),
            },
          ]}
          buttonLabel="Save"
          onButtonClick={handleSave}
          cancelButtonLabel="Cancel"
        />

        {/* Modal for confirming deletion */}
        <CustomModal
          showModal={state.showDeleteModal}
          onClose={() => setState((prevState) => ({ ...prevState, showDeleteModal: false }))}
          heading={
            <span className="text-danger " style={{ fontWeight: '900', fontSize: '1.5rem' }}>
              Alert !
            </span>
          }
          inputs={[
            {
              label: <>Are you sure you want to delete all the unpurchased lottery tickets?</>,
            },
          ]}
          buttonLabel="Delete"
          onButtonClick={handleDeleteConfirm} // Trigger delete when confirmed
          cancelButtonLabel="Cancel"
          textOnly={true}
        />

        <CustomModal
          showModal={state.showTicketModal}
          // onClose={() =>
          //   setState((prevState) => ({ ...prevState, showTicketModal: false }))
          // }
          onClose={handleCloseModal}
          heading="Generated Lottery Ticket Numbers"
          inputs={(state.inputs.tickets || []).map((ticket) => ({
            label: ticket,
          }))}
          textOnly={true} // Displays ticket numbers only
          buttonLabel="Create Tickets"
          onButtonClick={handleOpenModal}
          cancelButtonLabel="Cancel"
        />
      </div>
    </div>
  );
};

export default LotteryMarkets;
