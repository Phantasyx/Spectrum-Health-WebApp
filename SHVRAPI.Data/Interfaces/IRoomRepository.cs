//-----------------------------------------------------------------------
// <copyright file="IRoomRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data.Interfaces
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Interface for Room repository
    /// </summary>
    public interface IRoomRepository
    {
        /// <summary>
        /// Add room to database
        /// </summary>
        /// <param name="r">Room to be added</param>
        void AddRoom(Room r);

        /// <summary>
        /// Delete room from db
        /// </summary>
        /// <param name="r">Room to delete</param>
        void DeleteRoom(Room r);

        /// <summary>
        /// Get room from db
        /// </summary>
        /// <param name="id">id of room to get</param>
        /// <returns>Room requested</returns>
        Room Get(int id);

        /// <summary>
        /// Get all rooms from db
        /// </summary>
        /// <returns>list of rooms</returns>
        IEnumerable<Room> GetAll();

        /// <summary>
        /// Update the database by saving any changes
        /// </summary>
        void Update();
    }
}
