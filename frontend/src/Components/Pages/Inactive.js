import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import Pagination from "../Common/Pagination";
import { useAppContext } from "../../contextApi/context";
import { getIsActiveLottery, isRevokeLottery } from "../../Utils/apiService";
import SingleCard from "../Common/SingleCard";

const Inactive = () => {
    const { store } = useAppContext
    const [inactiveGames, setInactiveGames] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalPages, setTotalPages] = useState("");
    const [totalData, setTotalData] = useState("");
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        fetchInactiveGames();
    }, [refresh, currentPage, itemsPerPage]);

    const fetchInactiveGames = async () => {
        try {
            const res = await getIsActiveLottery({
                page: currentPage,
                limit: itemsPerPage,
                // searchTerm
            }
            );
            const gamesData = res?.data || [];
            console.log("gamesData", res.data);

            setInactiveGames(gamesData);
            setTotalData(res?.pagination?.totalItems);
            setTotalPages(res?.pagination?.totalPages);
        } catch (err) {
            console.error("Error fetching inactive games:", err);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleRevokeAnnouncement = async (marketId) => {
        console.log("first", marketId)
        try {
            const res = await isRevokeLottery({ marketId: marketId });
            if (res) {
                setRefresh((prev) => !prev)
            }
        } catch (err) {
            console.error("Error fetching inactive games:", err);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    let startIndex = Math.min(
        (Number(currentPage) - 1) * Number(itemsPerPage) + 1
    );
    let endIndex = Math.min(
        Number(currentPage) * Number(itemsPerPage),
        Number(totalData)
    );

    return (
        <div className="container my-5">
            <div className="card shadow-sm">
                <div
                    className="card-header"
                    style={{
                        backgroundColor: "#7D7D7D",
                        color: "#FFFFFF",
                    }}
                >
                    <h3 className="mb-0 fw-bold fs-5">Announced Game</h3>
                </div>
                <div className="card-body">
                    {/* Search and Entries Selection */}
                    {/* <div className="row mb-4">
                        <div className="col-md-6 position-relative">
                            <FaSearch
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "20px",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d",
                                    fontSize: "18px",
                                }}
                            />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by game name or market name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: "40px",
                                    borderRadius: "30px",
                                    border: "2px solid #6c757d",
                                }}
                            />
                            {searchTerm && (
                                <FaTimes
                                    onClick={handleClearSearch}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        right: "20px",
                                        transform: "translateY(-50%)",
                                        color: "#6c757d",
                                        cursor: "pointer",
                                    }}
                                />
                            )}
                        </div>

                        <div className="col-md-6 text-end">
                            <label className="me-2 fw-bold">Show</label>
                            <select
                                className="form-select rounded-pill d-inline-block w-auto"
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                style={{
                                    borderRadius: "50px",
                                    border: "2px solid #6c757d",
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <label className="ms-2 fw-bold">Entries</label>
                        </div>
                    </div> */}

                    {/* Table */}
                    <SingleCard
                        className=" mb-5 "
                        style={{
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 1)",
                        }}
                    >
                        <div className="table-responsive">
                            <table
                                className="table table-striped table-hover rounded-table"
                                style={{
                                    border: "2px solid #6c757d",
                                    borderRadius: "10px",
                                }}
                            >
                                <thead
                                    className="table-primary"
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    <tr>
                                        <th>Serial Number</th>
                                        <th>Game Name</th>
                                        <th>Market Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveGames.length > 0 ? (
                                        inactiveGames.map((game, index) => {
                                            console.log("game", game)
                                            return (
                                                <tr>
                                                    <td>
                                                        {index + 1}
                                                    </td>
                                                    <td >
                                                        {game.gameName}
                                                    </td>
                                                    <td >
                                                        {game.marketName}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() =>
                                                                handleRevokeAnnouncement(
                                                                    game.marketId
                                                                )
                                                            }
                                                        >
                                                            {`Revoke Announcement of ${game.marketName}`}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (<tr>
                                        <td colSpan="4" className="text-center">
                                            No inactive games found.
                                        </td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                    </SingleCard>

                    {/* Pagination */}
                    {inactiveGames.length > 0 && <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={handlePageChange}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        totalData={totalData}
                    />}

                </div>
            </div>
        </div>
    );
};

export default Inactive;
