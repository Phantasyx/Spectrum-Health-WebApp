//-----------------------------------------------------------------------
// <copyright file="RoomController.cs" company="Spectrum Health">
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
    /// Class for routing API calls for rooms
    /// </summary>
    [Produces("application/json")]
    [Route("api/room")]
    public class RoomController : Controller
    {
        /// <summary>
        /// Service for interacting with rooms in the database
        /// </summary>
        private readonly IRoomService roomService;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoomController"/> class.
        /// </summary>
        /// <param name="roomService">room service</param>
        public RoomController(IRoomService roomService)
        {
            this.roomService = roomService;
        }

        // GET: api/allrooms

        /// <summary>
        /// Call to get all rooms
        /// </summary>
        /// <returns>list of all rooms</returns>
        [HttpGet]
        [Route("/api/allrooms")]
        public List<Room> GetAllRooms()
        {
            return this.roomService.GetAll().ToList();
        }

        // GET: api/allrooms/4

        /// <summary>
        /// Call to get all rooms in a certain building
        /// </summary>
        /// <param name="buildId">id of the room to get</param>
        /// <returns>list of all rooms</returns>
        [HttpGet]
        [Route("/api/allrooms/{buildId}")]
        public List<Room> GetAllRoomsBuild(int buildId)
        {
            return this.roomService.GetAllInBuilding(buildId).ToList();
        }

        // GET: api/room/5

        /// <summary>
        /// Call to get specific room
        /// </summary>
        /// <param name="id">id of the room to get</param>
        /// <returns>room at id</returns>
        [HttpGet]
        [Route("/api/room/{id}")]
        public Room GetRoomById([FromRoute] int id)
        {
            /*if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }*/

            Room room = this.roomService.Get(id);

            if (room == null)
            {
                return null;

                // return this.NotFound();
            }

            return room;

            // return this.Ok(room);
        }

        // PUT: api/room/5
        // Untested

        /// <summary>
        /// Call to put room
        /// </summary>
        /// <param name="id">id for the room</param>
        /// <param name="room">room to put at id</param>
        /// <returns>no content</returns>
        [HttpPut("{id}")]
        public IActionResult PutRoom([FromRoute] int id, [FromBody] Room room)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            if (id != room.Id)
            {
                return this.BadRequest();
            }

            try
            {
                this.roomService.Update(room);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!this.RoomExists(id))
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

        // POST: api/room
        // Untested

        /// <summary>
        /// Post new room
        /// </summary>
        /// <param name="room">room to create</param>
        /// <returns>create action for new room</returns>
        [HttpPost]
        public int PostRoom([FromBody] Room room)
        {
            /*if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }*/

            int roomId = this.roomService.Create(room.Name, room.ImageFile, room.BuildingId);

            // return this.CreatedAtAction("GetRoom", new { id = roomId }, room);
            return roomId;
        }

        // DELETE: api/room/5
        // Untested

        /// <summary>
        /// Delete room
        /// </summary>
        /// <param name="id">id of room to delete</param>
        /// <returns>ok action</returns>
        [HttpDelete("{id}")]
        public IActionResult DeleteRoom([FromRoute] int id)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            var room = this.roomService.Get(id);
            if (room == null)
            {
                return this.NotFound();
            }

            this.roomService.Delete(room.Id);

            return this.Ok(room);
        }

        /// <summary>
        /// Check room existence
        /// </summary>
        /// <param name="id">id of room to check for</param>
        /// <returns>true or false</returns>
        private bool RoomExists(int id)
        {
            if (this.roomService.Get(id) != null)
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
