//-----------------------------------------------------------------------
// <copyright file="RoomRepository.cs" company="Spectrum Health">
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
    public class RoomRepository : IRoomRepository
    {
        /// <summary>
        /// Db context
        /// </summary>
        private readonly ApplicationDbContext context;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoomRepository"/> class.
        /// </summary>
        /// <param name="con">the db context</param>
        public RoomRepository(ApplicationDbContext con)
        {
            this.context = con;
        }

        /// <summary>
        /// Add room to db
        /// </summary>
        /// <param name="r">room to be added</param>
        public void AddRoom(Room r)
        {
            this.context.Room.Add(r);
            this.context.SaveChanges();
        }

        /// <summary>
        /// Delete room from db
        /// </summary>
        /// <param name="r">room to delete</param>
        public void DeleteRoom(Room r)
        {
            this.context.Room.Remove(r);
            this.context.SaveChanges();
        }

        /// <summary>
        /// Get room from db
        /// </summary>
        /// <param name="id">id of room to get</param>
        /// <returns>room requested</returns>
        public Room Get(int id)
        {
            return this.context.Room.Find(id);
        }

        /// <summary>
        /// Get all rooms from db
        /// </summary>
        /// <returns>list of rooms</returns>
        public IEnumerable<Room> GetAll()
        {
            return this.context.Room;
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
