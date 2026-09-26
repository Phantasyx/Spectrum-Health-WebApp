//-----------------------------------------------------------------------
// <copyright file="BuildingRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;
    using SHVRAPI.Data.Interfaces;

    /// <summary>
    /// Repo class that service classes use to interact with db
    /// </summary>
    public class BuildingRepository : IBuildingRepository
    {
        /// <summary>
        /// Db context
        /// </summary>
        private readonly ApplicationDbContext context;

        /// <summary>
        /// Initializes a new instance of the <see cref="BuildingRepository"/> class.
        /// </summary>
        /// <param name="con">the db context</param>
        public BuildingRepository(ApplicationDbContext con)
        {
            this.context = con;
        }

        /// <summary>
        /// Add building to database
        /// </summary>
        /// <param name="b">building to be added</param>
        public void AddBuilding(Building b)
        {
            this.context.Building.Add(b);
            this.context.SaveChanges();
        }

        /// <summary>
        /// Delete building from db
        /// </summary>
        /// <param name="b">building to delete</param>
        public void DeleteBuilding(Building b)
        {
            this.context.Building.Remove(b);
            this.context.SaveChanges();
        }

        /// <summary>
        /// Get building from db
        /// </summary>
        /// <param name="id">id of building to get</param>
        /// <returns>building requested</returns>
        public Building Get(int id)
        {
            return this.context.Building.Find(id);
        }

        /// <summary>
        /// Get all buildings from db
        /// </summary>
        /// <returns>list of buildings</returns>
        public IEnumerable<Building> GetAll()
        {
            return this.context.Building;
        }

        /// <summary>
        /// Update the database by saving any changes
        /// </summary>
        public void Update()
        {
            this.context.SaveChanges();
        }
    }
}
