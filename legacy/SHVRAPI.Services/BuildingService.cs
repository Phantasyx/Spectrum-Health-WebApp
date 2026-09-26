//-----------------------------------------------------------------------
// <copyright file="BuildingService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;
    using SHVRAPI.Data.Interfaces;
    using SHVRAPI.Services.Interfaces;

    /// <summary>
    /// Service class to interact with items in the building database
    /// </summary>
    public class BuildingService : IBuildingService
    {
        /// <summary>
        /// Repo used by service to interact with db directly
        /// </summary>
        private readonly IBuildingRepository buildingRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="BuildingService"/> class.
        /// </summary>
        /// <param name="buildingRepository">the building repo</param>
        public BuildingService(IBuildingRepository buildingRepository)
        {
            this.buildingRepository = buildingRepository;
        }

        /// <summary>
        /// Create building
        /// </summary>
        /// <param name="name">building to create</param>
        /// <returns>id of building created</returns>
        public int Create(string name)
        {
            Building temp = new Building
            {
                Name = name
            };

            this.buildingRepository.AddBuilding(temp);

            return temp.Id;
        }

        /// <summary>
        /// Delete building
        /// </summary>
        /// <param name="id">id of building to delete</param>
        public void Delete(int id)
        {
            Building building = this.Get(id);

            if (building != null)
            {
                this.buildingRepository.DeleteBuilding(building);
            }
        }

        /// <summary>
        /// Call to get specific building
        /// </summary>
        /// <param name="id">id of building to get</param>
        /// <returns>building requested</returns>
        public Building Get(int id)
        {
            return this.buildingRepository.Get(id);
        }

        /// <summary>
        /// Call to get all buildings
        /// </summary>
        /// <returns>list of all buildings</returns>
        public IEnumerable<Building> GetAll()
        {
            return this.buildingRepository.GetAll();
        }

        /// <summary>
        /// Update building
        /// </summary>
        /// <param name="building">building to update</param>
        public void Update(Building building)
        {
            Building database = this.Get(building.Id);

            if (database != null)
            {
                database.Name = building.Name;

                this.buildingRepository.Update();
            }
        }
    }
}