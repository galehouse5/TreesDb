using AutoMapper;
using System;
using TMD.Model;

namespace TMD.Models
{
    public interface IGeoAreaMetricsModel
    {
        float? RHI5 { get; set; }
        float? RHI10 { get; set; }
        float? RHI20 { get; set; }
        float? RGI5 { get; set; }
        float? RGI10 { get; set; }
        float? RGI20 { get; set; }
        int? TreesMeasuredCount { get; set; }
        DateTime? LastMeasurementDate { get; set; }
        bool? ContainsEntityWithCoordinates { get; set; }
    }

    public static class IGeoAreaMetricsModelExensions
    {
        public static IMappingExpression<TEntity, TModel> ForGeoAreaMetricsMembers<TEntity, TModel>(this IMappingExpression<TEntity, TModel> expression)
            where TEntity : IEntity, IGeoAreaMetrics
            where TModel : IGeoAreaMetricsModel
            => expression
            .ForMember(m => m.RHI5, opt => opt.MapFrom(e => e.ComputedRHI5))
            .ForMember(m => m.RHI10, opt => opt.MapFrom(e => e.ComputedRHI10))
            .ForMember(m => m.RHI20, opt => opt.MapFrom(e => e.ComputedRHI20))
            .ForMember(m => m.RGI5, opt => opt.MapFrom(e => e.ComputedRGI5))
            .ForMember(m => m.RGI10, opt => opt.MapFrom(e => e.ComputedRGI10))
            .ForMember(m => m.RGI20, opt => opt.MapFrom(e => e.ComputedRGI20))
            .ForMember(m => m.TreesMeasuredCount, opt => opt.MapFrom(e => e.ComputedTreesMeasuredCount))
            .ForMember(m => m.LastMeasurementDate, opt => opt.MapFrom(e => e.ComputedLastMeasurementDate))
            .ForMember(m => m.ContainsEntityWithCoordinates, opt => opt.MapFrom(e => e.ComputedContainsEntityWithCoordinates));
    }
}