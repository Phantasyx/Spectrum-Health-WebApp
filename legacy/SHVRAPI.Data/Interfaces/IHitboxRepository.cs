//-----------------------------------------------------------------------
// <copyright file="IHitboxRepository.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Data.Interfaces
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Interface for Hitbox repository
    /// </summary>
    public interface IHitboxRepository
    {
        /// <summary>
        /// Add hitbox to database
        /// </summary>
        /// <param name="h">Hitbox to be added</param>
        void AddHitbox(Hitbox h);

        /// <summary>
        /// Delete hitbox from db
        /// </summary>
        /// <param name="b">Hitbox to delete</param>
        void DeleteHitbox(Hitbox b);

        /// <summary>
        /// Get hitbox from db
        /// </summary>
        /// <param name="id">id of hitbox to get</param>
        /// <returns>Hitbox requested</returns>
        Hitbox Get(int id);

        /// <summary>
        /// Get all hitboxes from db
        /// </summary>
        /// <returns>List of hitboxes</returns>
        IEnumerable<Hitbox> GetAll();

        /// <summary>
        /// Update the database by saving any changes
        /// </summary>
        void Update();
    }
}