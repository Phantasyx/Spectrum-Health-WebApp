//-----------------------------------------------------------------------
// <copyright file="BuildingController.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Areas.Admin.Controllers
{
    using System.Collections.Generic;
    using System.Linq;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using SHVRAPI.Core.Models;
    using SHVRAPI.Services.Interfaces;

    /// <summary>
    /// Class for routing API calls for buildings
    /// </summary>
    [Produces("application/json")]
    [Route("api/building")]
    public class BuildingController : Controller
    {
        /// <summary>
        /// Service for interacting with building in the database
        /// </summary>
        private readonly IBuildingService buildingService;

        /// <summary>
        /// Initializes a new instance of the <see cref="BuildingController"/> class.
        /// </summary>
        /// <param name="buildingService">building service</param>
        public BuildingController(IBuildingService buildingService)
        {
            this.buildingService = buildingService;
        }

        // GET: api/building

        /// <summary>
        /// Call to get all buildings
        /// </summary>
        /// <returns>list of all buildings</returns>
        [HttpGet]
        public List<Building> GetAllBuildings()
        {
            List<Building> allBuildings = this.buildingService.GetAll().ToList();
            List<Building> alphaList = allBuildings.OrderBy(x => x.Name).ToList();
            return alphaList;
        }

        // GET: api/building/5

        /// <summary>
        /// Call to get specific building
        /// </summary>
        /// <param name="id">id of the building to get</param>
        /// <returns>building at id</returns>
        [HttpGet("{id}")]
        public IActionResult GetBuildingById([FromRoute] int id)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            Building building = this.buildingService.Get(id);

            if (building == null)
            {
                return this.NotFound();
            }

            return this.Ok(building);
        }

        // PUT: api/building/5
        // Untested

        /// <summary>
        /// Call to put building
        /// </summary>
        /// <param name="id">id for the building</param>
        /// <param name="building">building to put at id</param>
        /// <returns>no content</returns>
        [HttpPut("{id}")]
        public IActionResult PutBuilding([FromRoute] int id, [FromBody] Building building)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            if (id != building.Id)
            {
                return this.BadRequest();
            }

            try
            {
                this.buildingService.Update(building);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!this.BuildingExists(id))
                {
                    return this.NotFound();
                }
                else
                {
                    throw;
                }
            }

            return this.NoContent();
        }

        // POST: api/building
        // Untested

        /// <summary>
        /// Post new building
        /// </summary>
        /// <param name="building">building to create</param>
        /// <returns>create action for new building</returns>
        [HttpPost]
        public int PostBuilding([FromBody] Building building)
        {
            /*if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }*/

            int id = this.buildingService.Create(building.Name);

            // return this.CreatedAtAction("GetBuilding", new { id = building.Id }, building);
            return id;
        }

        // DELETE: api/building/5
        // Untested

        /// <summary>
        /// Delete building
        /// </summary>
        /// <param name="id">id of building to delete</param>
        /// <returns>ok action</returns>
        [HttpDelete("{id}")]
        public IActionResult DeleteBuilding([FromRoute] int id)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            var building = this.buildingService.Get(id);
            if (building == null)
            {
                return this.NotFound();
            }

            this.buildingService.Delete(building.Id);

            return this.Ok(building);
        }

        /// <summary>
        /// Check building existence
        /// </summary>
        /// <param name="id">id of building to check for</param>
        /// <returns>true or false</returns>
        private bool BuildingExists(int id)
        {
            if (this.buildingService.Get(id) != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
