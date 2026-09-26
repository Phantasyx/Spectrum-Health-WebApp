//-----------------------------------------------------------------------
// <copyright file="IHitboxService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services.Interfaces
{
    using System.Collections.Generic;
    using SHVRAPI.Core.Models;

    /// <summary>
    /// Interface for hitbox service class to interact with items in the database
    /// </summary>
    public interface IHitboxService
    {
        /// <summary>
        /// Create hitbox
        /// </summary>
        /// <param name="top">the top y position</param>
        /// <param name="bottom">the bottom y position</param>
        /// <param name="left">the left x position</param>
        /// <param name="right">the right x position</param>
        /// <param name="text">title text</param>
        /// <param name="sub">sub text</param>
        /// <param name="room">id of the room</param>
        /// <returns>id of hitbox created</returns>
        int Create(float top, float bottom, float left, float right, string text, string sub, int room);

        /// <summary>
        /// Delete hitbox
        /// </summary>
        /// <param name="id">id of hitbox to delete</param>
        void Delete(int id);

        /// <summary>
        /// Call to get specific hitbox
        /// </summary>
        /// <param name="id">id of hitbox to get</param>
        /// <returns>hitbox requested</returns>
        Hitbox Get(int id);

        /// <summary>
        /// Call to get all hitboxes
        /// </summary>
        /// <returns>list of all hitboxes</returns>
        IEnumerable<Hitbox> GetAll();

        /// <summary>
        /// Call to get all hitboxes in a room
        /// </summary>
        /// <param name="roomId">id of room to get hitboxes for</param>
        /// <returns>list of all hitboxes in that room</returns>
        List<Hitbox> GetAllInRoom(int roomId);

        /// <summary>
        /// Update hitbox
        /// </summary>
        /// <param name="hitbox">hitbox to update</param>
        void Update(Hitbox hitbox);
    }
}