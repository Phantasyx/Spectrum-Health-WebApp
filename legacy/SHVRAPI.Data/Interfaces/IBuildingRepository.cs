//-----------------------------------------------------------------------
// <copyright file="IBuildingRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data.Interfaces
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Interface for Building repository
    /// </summary>
    public interface IBuildingRepository
    {
        /// <summary>
        /// Add building to database
        /// </summary>
        /// <param name="b">Building to be added</param>
        void AddBuilding(Building b);

        /// <summary>
        /// Delete building from db
        /// </summary>
        /// <param name="b">Building to delete</param>
        void DeleteBuilding(Building b);

        /// <summary>
        /// Get building from db
        /// </summary>
        /// <param name="id">id of building to get</param>
        /// <returns>Building requested</returns>
        Building Get(int id);

        /// <summary>
        /// Get all buildings from db
        /// </summary>
        /// <returns>List of buildings</returns>
        IEnumerable<Building> GetAll();

        /// <summary>
        /// Update the database by saving any changes
        /// </summary>
        void Update();
    }
}
