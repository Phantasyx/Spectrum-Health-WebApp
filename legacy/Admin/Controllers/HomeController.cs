//-----------------------------------------------------------------------
// <copyright file="HomeController.cs" company="Spectrum Health">
//     Copyright (c) Spectrum Health. All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
namespace SHVRAPI.Areas.Admin.Controllers
{
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using SHVRAPI.Areas.Public.Controllers;
    using SHVRAPI.Core.Models;

    [Area("Admin")]
    /// <summary>
    /// Home controller
    /// </summary>
    public class HomeController : Controller
    {
        /// <summary>
        /// Controller that uses the service to get building data
        /// </summary>
        private readonly BuildingController buildingController;

        /// <summary>
        /// Controller that uses the service to get room data
        /// </summary>
        private readonly RoomController roomController;

        /// <summary>
        /// Controller that uses the service to get hitbox data
        /// </summary>
        private readonly HitboxController hitboxController;

        /// <summary>
        /// Controller that uses the service to upload images
        /// </summary>
        private readonly UploadFilesController uploadFilesController;

        /// <summary>
        /// Controller that gets info from databases
        /// </summary>
        private readonly GetController getController;

        /// <summary>
        /// Initializes a new instance of the <see cref="HomeController"/> class.
        /// </summary>
        /// <param name="buildingController">controller to get building info</param>
        /// <param name="roomController">controller to get room info</param>
        /// <param name="hitboxController">controller to get hitbox info</param>
        /// <param name="uploadFilesController">controller to upload images</param>
        /// <param name="getController">controller to get info from database</param>
        public HomeController(BuildingController buildingController, RoomController roomController, HitboxController hitboxController, UploadFilesController uploadFilesController, GetController getController)
        {
            this.buildingController = buildingController;
            this.roomController = roomController;
            this.hitboxController = hitboxController;
            this.uploadFilesController = uploadFilesController;
            this.getController = getController;
        }

        /// <summary>
        /// Index home page
        /// </summary>
        /// <returns>the view</returns>
        [Authorize]
        public IActionResult Index()
        {
            var buildings = this.buildingController.GetAllBuildings().ToList();
            return this.View(buildings);
        }

        /// <summary>
        /// Page for deleting rooms
        /// </summary>
        /// <returns>the view</returns>
        [Authorize]
        public IActionResult DeleteRoom()
        {
            return this.View(this.getController);
        }

        /// <summary>
        /// Deletes the room selected
        /// </summary>
        /// <param name="roomid">the room to delete</param>
        /// <returns>the view</returns>
        [Authorize]
        public IActionResult RoomDeleted(string roomid)
        {
            int id = int.Parse(roomid);

            // Delete all of the hitboxes in the room
            List<Hitbox> hitboxes = this.hitboxController.GetAllHitboxes(id);
            foreach (Hitbox hitbox in hitboxes)
            {
                this.hitboxController.DeleteHitbox(hitbox.Id);
            }

            this.roomController.DeleteRoom(id);
            return this.View();
        }

        /// <summary>
        /// Deletes a building and all of its rooms
        /// </summary>
        /// <param name="buildingid">the building to delete</param>
        /// <returns>the view</returns>
        [Authorize]
        public IActionResult BuildingDeleted(string buildingid)
        {
            int id = int.Parse(buildingid);

            // Delete all of the rooms in the building
            List<Room> rooms = this.roomController.GetAllRoomsBuild(id);
            foreach (Room room in rooms)
            {
                // Delete all of the hitboxes in the room
                List<Hitbox> hitboxes = this.hitboxController.GetAllHitboxes(room.Id);
                foreach (Hitbox hitbox in hitboxes)
                {
                    this.hitboxController.DeleteHitbox(hitbox.Id);
                }

                this.roomController.DeleteRoom(room.Id);
            }

            this.buildingController.DeleteBuilding(id);
            return this.View();
        }

        /// <summary>
        /// Creates and Posts a list of information from the user upload
        /// </summary>
        /// <returns>the entry created view</returns>
        [HttpPost]
        [Authorize]
        public IActionResult CreateEntry()
        {
            // Get the image file and upload it
            IFormFile pre = this.HttpContext.Request.Form.Files[0];
            this.uploadFilesController.PostUpload(pre);

            // Get the building info from the form
            int buildId = 0;
            string buildingVal = this.HttpContext.Request.Form["buildName"];
            var isNumeric = int.TryParse(buildingVal, out int n);
            if (isNumeric)
            {
                // if it's an integer, pre-existing building (value + 1 = building ID)
                buildId = n + 1;
            }
            else
            {
                // else it's a new building, make it
                Building newBuild = new Building
                {
                    Name = buildingVal
                };
                buildId = this.buildingController.PostBuilding(newBuild);
            }

            // Get the room info from the form
            string name = this.HttpContext.Request.Form["roomName"];
            string imageFile = "\\UploadFiles\\" + pre.FileName;

            // Create the room model
            Room room = new Room
            {
                Name = name,
                ImageFile = imageFile,
                BuildingId = buildId
            };

            // Post the room and get its id
            int id = this.roomController.PostRoom(room);

            // Get all hitbox data from the form
            var hboxes = this.HttpContext.Request.Form["hbs"].ToArray();

            // Split it by the ^ delimiter to split into individual hitboxes
            List<string> allhbdata = hboxes[0].Split('^').ToList();

            // Go through each hitbox
            for (int i = 0; i < allhbdata.Count(); i++)
            {
                // Split it by the * delimiter to split into the hitbox data
                // for this hitbox
                List<string> hbdata = allhbdata[i].Split('*').ToList();
                if (hbdata[0].Count() > 0)
                {
                    // Only add it if there is data
                    float hitboxTop = float.Parse(hbdata[0]);
                    float hitboxBot = float.Parse(hbdata[1]);
                    float hitboxLeft = float.Parse(hbdata[2]);
                    float hitboxRight = float.Parse(hbdata[3]);
                    string hitboxText = hbdata[4];
                    string hitboxSub = hbdata[5];

                    // Create the hitbox model and post it
                    Hitbox hitbox = new Hitbox
                    {
                        RoomId = id,
                        Top = hitboxTop,
                        Bottom = hitboxBot,
                        Left = hitboxLeft,
                        Right = hitboxRight,
                        Sub = hitboxSub,
                        Text = hitboxText
                    };
                    this.hitboxController.PostHitbox(hitbox);
                }
            }

            return this.View();
        }

        /// <summary>
        /// Used to make a unique file name
        /// </summary>
        /// <param name="fileName">the original file name</param>
        /// <returns>the new file name</returns>
        private string GetUniqueFileName(string fileName)
        {
            fileName = Path.GetFileName(fileName);

            string testc = Path.GetFileNameWithoutExtension(fileName);
            string test = testc.Substring(0, 10);
            return test + "_"
                      + System.Guid.NewGuid().ToString().Substring(0, 4)
                      + Path.GetExtension(fileName);
        }
    }
}