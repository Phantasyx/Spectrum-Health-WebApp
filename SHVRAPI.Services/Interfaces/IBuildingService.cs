//-----------------------------------------------------------------------
// <copyright file="IBuildingService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services.Interfaces
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Interface for building service class to interact with items in the database
    /// </summary>
    public interface IBuildingService
    {
        /// <summary>
        /// Create building
        /// </summary>
        /// <param name="name">building to create</param>
        /// <returns>id of building created</returns>
        int Create(string name);

        /// <summary>
        /// Delete building
        /// </summary>
        /// <param name="id">id of building to delete</param>
        void Delete(int id);

        /// <summary>
        /// Call to get specific building
        /// </summary>
        /// <param name="id">id of building to get</param>
        /// <returns>building requested</returns>
        Building Get(int id);

        /// <summary>
        /// Call to get all buildings
        /// </summary>
        /// <returns>list of all buildings</returns>
        IEnumerable<Building> GetAll();

        /// <summary>
        /// Update building
        /// </summary>
        /// <param name="building">building to update</param>
        void Update(Building building);
    }
}