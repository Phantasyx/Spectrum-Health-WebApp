//-----------------------------------------------------------------------
// <copyright file="HitboxController.cs" company="Spectrum Health">
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
    /// Class for routing API calls for hitboxes
    /// </summary>
    [Produces("application/json")]
    [Route("api/hitbox")]
    public class HitboxController : Controller
    {
        /// <summary>
        /// Service for interacting with hitbox in the database
        /// </summary>
        private readonly IHitboxService hitboxService;

        /// <summary>
        /// Initializes a new instance of the <see cref="HitboxController"/> class.
        /// </summary>
        /// <param name="hitboxService">hitbox service</param>
        public HitboxController(IHitboxService hitboxService)
        {
            this.hitboxService = hitboxService;
        }

        // GET: api/allhitboxes

        /// <summary>
        /// Call to get all hitboxes in the database
        /// </summary>
        /// <returns>list of all hitboxes in a room</returns>
        [Route("/api/allhitboxes")]
        public List<Hitbox> GetAll()
        {
            return this.hitboxService.GetAll().ToList();
        }

        // GET: api/allhitboxes/2

        /// <summary>
        /// Call to get all hitboxes from a room
        /// </summary>
        /// <param name="roomId">id of the room to get hitboxes from</param>
        /// <returns>list of all hitboxes in a room</returns>
        [Route("/api/allhitboxes/{roomId}")]
        public List<Hitbox> GetAllHitboxes(int roomId)
        {
            return this.hitboxService.GetAllInRoom(roomId);
        }

        // GET: api/hitbox/5

        /// <summary>
        /// Call to get specific hitbox
        /// </summary>
        /// <param name="id">id of the hitbox to get</param>
        /// <returns>hitbox at id</returns>
        [HttpGet("{id}")]
        public IActionResult GetHitboxById([FromRoute] int id)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            Hitbox hitbox = this.hitboxService.Get(id);

            if (hitbox == null)
            {
                return this.NotFound();
            }

            return this.Ok(hitbox);
        }

        // PUT: api/hitbox/5
        // Untested

        /// <summary>
        /// Call to put hitbox
        /// </summary>
        /// <param name="id">id for the hitbox</param>
        /// <param name="hitbox">hitbox to put at id</param>
        /// <returns>no content</returns>
        [HttpPut("{id}")]
        public IActionResult PutHitbox([FromRoute] int id, [FromBody] Hitbox hitbox)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            if (id != hitbox.Id)
            {
                return this.BadRequest();
            }

            try
            {
                this.hitboxService.Update(hitbox);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!this.HitboxExists(id))
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

        // POST: api/hitbox
        // Untested

        /// <summary>
        /// Post new hitbox
        /// </summary>
        /// <param name="hitbox">hitbox to create</param>
        /// <returns>create action for new hitbox</returns>
        [HttpPost]
        public IActionResult PostHitbox([FromBody] Hitbox hitbox)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            this.hitboxService.Create(hitbox.Top, hitbox.Bottom, hitbox.Left, hitbox.Right, hitbox.Text, hitbox.Sub, hitbox.RoomId);

            return this.CreatedAtAction("GetHitbox", new { id = hitbox.Id }, hitbox);
        }

        // DELETE: api/hitbox/5
        // Untested

        /// <summary>
        /// Delete hitbox
        /// </summary>
        /// <param name="id">id of hitbox to delete</param>
        /// <returns>ok action</returns>
        [HttpDelete("{id}")]
        public IActionResult DeleteHitbox([FromRoute] int id)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            var hitbox = this.hitboxService.Get(id);
            if (hitbox == null)
            {
                return this.NotFound();
            }

            this.hitboxService.Delete(hitbox.Id);

            return this.Ok(hitbox);
        }

        /// <summary>
        /// Check hitbox existence
        /// </summary>
        /// <param name="id">id of hitbox to check for</param>
        /// <returns>true or false</returns>
        private bool HitboxExists(int id)
        {
            if (this.hitboxService.Get(id) != null)
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