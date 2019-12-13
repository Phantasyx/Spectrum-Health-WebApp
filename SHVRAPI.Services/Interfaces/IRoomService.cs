//-----------------------------------------------------------------------
// <copyright file="IRoomService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services.Interfaces
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Interface for room service class to interact with items in the database
    /// </summary>
    public interface IRoomService
    {
        /// <summary>
        /// Create room
        /// </summary>
        /// <param name="name">room to create</param>
        /// <param name="file">file path to image</param>
        /// <param name="building">the building id</param>
        /// <returns>id of room created</returns>
        int Create(string name, string file, int building);

        /// <summary>
        /// Delete room
        /// </summary>
        /// <param name="id">id of room to delete</param>
        void Delete(int id);

        /// <summary>
        /// Call to get specific room
        /// </summary>
        /// <param name="id">id of room to get</param>
        /// <returns>room requested</returns>
        Room Get(int id);

        /// <summary>
        /// Call to get all rooms
        /// </summary>
        /// <returns>list of all rooms</returns>
        IEnumerable<Room> GetAll();

        /// <summary>
        /// Call to get all rooms in a certain building
        /// </summary>
        /// <param name="buildingId">id of building</param>
        /// <returns>list of all rooms in that building</returns>
        List<Room> GetAllInBuilding(int buildingId);

        /// <summary>
        /// Update room
        /// </summary>
        /// <param name="room">room to update</param>
        void Update(Room room);
    }
}
