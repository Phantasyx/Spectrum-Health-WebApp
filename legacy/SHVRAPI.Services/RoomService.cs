//-----------------------------------------------------------------------
// <copyright file="RoomService.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using SHVRAPI.Core.Models;
    using SHVRAPI.Data.Interfaces;
    using SHVRAPI.Services.Interfaces;

    /// <summary>
    /// Service class to interact with items in the room database
    /// </summary>
    public class RoomService : IRoomService
    {
        /// <summary>
        /// Repo used by service to interact with db directly
        /// </summary>
        private readonly IRoomRepository roomRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoomService"/> class.
        /// </summary>
        /// <param name="roomRepository">the room repo</param>
        public RoomService(IRoomRepository roomRepository)
        {
            this.roomRepository = roomRepository;
        }

        /// <summary>
        /// Create room
        /// </summary>
        /// <param name="name">room to create</param>
        /// <param name="file">file path to image</param>
        /// <param name="building">the building id</param>
        /// <returns>id of room created</returns>
        public int Create(string name, string file, int building)
        {
            Room temp = new Room
            {
                Name = name,
                ImageFile = file,
                BuildingId = building
            };

            this.roomRepository.AddRoom(temp);

            return temp.Id;
        }

        /// <summary>
        /// Delete room
        /// </summary>
        /// <param name="id">id of room to delete</param>
        public void Delete(int id)
        {
            Room room = this.Get(id);

            if (room != null)
            {
                this.roomRepository.DeleteRoom(room);
            }
        }

        /// <summary>
        /// Call to get specific room
        /// </summary>
        /// <param name="id">id of room to get</param>
        /// <returns>room requested</returns>
        public Room Get(int id)
        {
            return this.roomRepository.Get(id);
        }

        /// <summary>
        /// Call to get all rooms
        /// </summary>
        /// <returns>list of all rooms</returns>
        public IEnumerable<Room> GetAll()
        {
            return this.roomRepository.GetAll();
        }

        /// <summary>
        /// Call to get all rooms in a certain building
        /// </summary>
        /// <param name="buildingId">id of building</param>
        /// <returns>list of all rooms in that building, alphabetized</returns>
        public List<Room> GetAllInBuilding(int buildingId)
        {
            List<Room> roomsInBuild = new List<Room>();
            IEnumerable<Room> allRooms = this.GetAll();
            foreach (var room in allRooms)
            {
                if (room.BuildingId == buildingId)
                {
                    roomsInBuild.Add(room);
                }
            }

            // Alphabetize the list
            var alphaList = roomsInBuild.OrderBy(x => x.Name).ToList();

            return alphaList;
        }

        /// <summary>
        /// Update room
        /// </summary>
        /// <param name="room">room to update</param>
        public void Update(Room room)
        {
            Room database = this.Get(room.Id);

            if (database != null)
            {
                database.Name = room.Name;

                this.roomRepository.Update();
            }
        }
    }
}
