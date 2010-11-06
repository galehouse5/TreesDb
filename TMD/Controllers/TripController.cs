using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Trips;
using TMD.Model;

namespace TMD.Controllers
{
    public enum ETripWidgetOptions
    {
        None, Edit, View
    }

    public enum ESiteVisitWidgetOptions
    {
        None, Edit, Review
    }

    public enum ESubsiteVisitWidgetOptions
    {
        None, Edit, Review, AddTreeMeasurements
    }

    public enum ETreeMeasurementWidgetOptions
    {
        None, Edit, Review
    }

    public enum ETrunkMeasurementWidgetOptions
    {
        None, Edit
    }

    public class TripController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult Widget(int id, ETripWidgetOptions options)
        {
            Trip trip = TripService.FindById(id);
            if (trip.Creator != User)
            {
                return new UnauthorizedResult();
            }
            ViewData.WidgetOptions = options;
            return PartialView(trip);
        }

        public ActionResult Edit(int id)
        {
            Trip trip = TripService.FindById(id);
            if (trip.Creator != User)
            {
                return new UnauthorizedResult();
            }
            while (trip.Measurers.Count < 3)
            {
                trip.AddMeasurer();
            }
            return PartialView(trip);
        }

        public class TripModelBinder : DefaultModelBinder
        {
            protected override object CreateModel(ControllerContext controllerContext, ModelBindingContext bindingContext, Type modelType)
            {
                int id = Convert.ToInt32(bindingContext.ValueProvider.GetValue("Id").AttemptedValue);
                return TripService.FindById(id);
            }

            override v
        }

        [HttpPost]
        public ActionResult Edit([ModelBinder(typeof(TripModelBinder))] Trip trip)
        {
            if (trip.Creator != User)
            {
                return new UnauthorizedResult();
            }
            trip.Validate(


            return PartialView(trip);
        }

        [ActionName("Delete")]
        public ActionResult ConfirmDelete(int id)
        {
            Trip trip = TripService.FindById(id);
            if (trip.Creator != User)
            {
                return new UnauthorizedResult();
            }
            ViewData.WidgetOptions = ETripWidgetOptions.None;
            return PartialView(trip);
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            Trip trip = TripService.FindById(id);
            if (trip.Creator != User)
            {
                return new UnauthorizedResult();
            }
            using (UnitOfWork.BeginBusinessTransaction())
            {
                TripService.Remove(trip);
                UnitOfWork.Persist();
            }
            return Json(new {
                TripId = id
            });
        }

        





        //#region Trip

        //public ActionResult Edit(int id)
        //{

        //}

        //[HttpPut]
        //public ActionResult Edit(Trip model)
        //{

        //}

        //public ActionResult Delete(int id)
        //{

        //}

        //[HttpDelete]
        //public ActionResult Delete(Trip model)
        //{

        //}

        //#endregion

        //#region SiteVisit

        //public ActionResult EditSiteVisit(int id)
        //{

        //}

        //[HttpPut]
        //public ActionResult EditSiteVisit(SiteVisit model)
        //{

        //}

        //public ActionResult DeleteSiteVisit(int id)
        //{

        //}

        //[HttpDelete]
        //public ActionResult DeleteSiteVisit(SiteVisit model)
        //{

        //}

        //[ChildActionOnly]
        //public ActionResult SiteVisitWidget(SiteVisit model)
        //{

        //}

        //#endregion










        ////
        //// GET: /Trip/

        //public ActionResult Index()
        //{
        //    return View();
        //}

        ////
        //// GET: /Trip/Details/5

        //public ActionResult Details(int id)
        //{
        //    return View();
        //}

        ////
        //// GET: /Trip/Create

        //public ActionResult Create()
        //{
        //    return View();
        //} 

        ////
        //// POST: /Trip/Create

        //[HttpPost]
        //public ActionResult Create(FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add insert logic here

        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}
        
        ////
        //// GET: /Trip/Edit/5
 
        //public ActionResult Edit(int id)
        //{
        //    return View();
        //}

        ////
        //// POST: /Trip/Edit/5

        //[HttpPost]
        //public ActionResult Edit(int id, FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add update logic here
 
        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}

        ////
        //// GET: /Trip/Delete/5
 
        //public ActionResult Delete(int id)
        //{
        //    return View();
        //}

        ////
        //// POST: /Trip/Delete/5

        //[HttpPost]
        //public ActionResult Delete(int id, FormCollection collection)
        //{
        //    try
        //    {
        //        // TODO: Add delete logic here
 
        //        return RedirectToAction("Index");
        //    }
        //    catch
        //    {
        //        return View();
        //    }
        //}
    }
}
