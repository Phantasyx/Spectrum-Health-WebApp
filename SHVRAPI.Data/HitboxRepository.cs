//-----------------------------------------------------------------------
// <copyright file="HitboxRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data
{
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using SHVRAPI.Core.Models;
    using SHVRAPI.Data.Interfaces;

    /// <summary>
    /// Repo class that service classes use to interact with db
    /// </summary>
    public class HitboxRepository : IHitboxRepository
    {
        /// <summary>
        /// Db context
        /// </summary>
        private readonly ApplicationDbContext context;

        /// <summary>
        /// Initializes a new instance of the <see cref="HitboxRepository"/> class.
        /// </summary>
        /// <param name="con">the db context</param>
        public HitboxRepository(ApplicationDbContext con)
        {
            this.context = con;
        }

        /// <summary>
        /// Add hitbox to database
        /// </summary>
        /// <param name="h">hitbox to be added</param>
        public void AddHitbox(Hitbox h)
        {
            this.context.Hitbox.Add(h);
            this.context.SaveChanges();
        }

        /// <summary>
        /// Delete hitbox from db
        /// </summary>
        /// <param name="h">hitbox to delete</param>
        public void DeleteHitbox(Hitbox h)
        {
            this.context.Hitbox.Remove(h);
            this.context.SaveChanges();
        }

        /// <summary>
        /// Get hitbox from db
        /// </summary>
        /// <param name="id">id of hitbox to get</param>
        /// <returns>hitbox requested</returns>
        public Hitbox Get(int id)
        {
            return this.context.Hitbox.Find(id);
        }

        /// <summary>
        /// Get all hitboxes from db
        /// </summary>
        /// <returns>list of hitboxes</returns>
        public IEnumerable<Hitbox> GetAll()
        {
            return this.context.Hitbox;
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