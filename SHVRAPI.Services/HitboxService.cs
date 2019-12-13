//-----------------------------------------------------------------------
// <copyright file="HitboxService.cs" company="Spectrum Health">
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
    /// Service class to interact with items in the hitbox database
    /// </summary>
    public class HitboxService : IHitboxService
    {
        /// <summary>
        /// Repo used by service to interact with db directly
        /// </summary>
        private readonly IHitboxRepository hitboxRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="HitboxService"/> class.
        /// </summary>
        /// <param name="hitboxRepository">the hitbox repo</param>
        public HitboxService(IHitboxRepository hitboxRepository)
        {
            this.hitboxRepository = hitboxRepository;
        }

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
        public int Create(float top, float bottom, float left, float right, string text, string sub, int room)
        {
            Hitbox temp = new Hitbox
            {
                Top = top,
                Bottom = bottom,
                Left = left,
                Right = right,
                Text = text,
                Sub = sub,
                RoomId = room
            };

            this.hitboxRepository.AddHitbox(temp);

            return temp.Id;
        }

        /// <summary>
        /// Delete hitbox
        /// </summary>
        /// <param name="id">id of hitbox to delete</param>
        public void Delete(int id)
        {
            Hitbox hitbox = this.Get(id);

            if (hitbox != null)
            {
                this.hitboxRepository.DeleteHitbox(hitbox);
            }
        }

        /// <summary>
        /// Call to get specific hitbox
        /// </summary>
        /// <param name="id">id of hitbox to get</param>
        /// <returns>hitbox requested</returns>
        public Hitbox Get(int id)
        {
            return this.hitboxRepository.Get(id);
        }

        /// <summary>
        /// Call to get all hitboxes
        /// </summary>
        /// <returns>list of all hitboxes</returns>
        public IEnumerable<Hitbox> GetAll()
        {
            return this.hitboxRepository.GetAll();
        }

        /// <summary>
        /// Call to get all hitboxes in a room
        /// </summary>
        /// <param name="roomId">id of room to get hitboxes for</param>
        /// <returns>list of all hitboxes in that room</returns>
        public List<Hitbox> GetAllInRoom(int roomId)
        {
            List<Hitbox> hitboxesInRoom = new List<Hitbox>();
            IEnumerable<Hitbox> allHitboxes = this.GetAll();

            foreach (var hitbox in allHitboxes)
            {
                if (hitbox.RoomId == roomId)
                {
                    hitboxesInRoom.Add(hitbox);
                }
            }

            return hitboxesInRoom;
        }

        /// <summary>
        /// Update hitbox
        /// </summary>
        /// <param name="hitbox">hitbox to update</param>
        public void Update(Hitbox hitbox)
        {
            Hitbox database = this.Get(hitbox.Id);

            if (database != null)
            {
                this.hitboxRepository.Update();
            }
        }
    }
}