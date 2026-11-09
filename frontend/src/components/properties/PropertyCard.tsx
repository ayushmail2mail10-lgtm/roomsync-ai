import React from 'react';
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  IndianRupee, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import { PropertyListing } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface PropertyCardProps {
  property: PropertyListing;
  onViewDetails: (property: PropertyListing) => void;
  onApply?: (property: PropertyListing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onApply
}) => {
  const isAvailable = property.available_bedrooms > 0 && property.status === 'active';
  const defaultImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
  const displayImage = property.image_urls && property.image_urls.length > 0 ? property.image_urls[0] : defaultImage;

  return (
    <Card 
      isInteractive={true}
      padding="none"
      className="overflow-hidden flex flex-col group border-[#1E283A] hover:border-[#00F59B]/50 transition-all duration-300"
    >
      {/* Property Image Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0A0E17]">
        <img
          src={displayImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111722] via-[#111722]/30 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge 
            variant={isAvailable ? 'green' : 'neutral'}
            className="text-[10px] font-mono tracking-wider backdrop-blur-md"
          >
            {isAvailable ? `${property.available_bedrooms} ROOM${property.available_bedrooms > 1 ? 'S' : ''} VACANT` : 'OCCUPIED'}
          </Badge>
          <Badge 
            variant="cyan"
            className="text-[10px] font-mono tracking-wider backdrop-blur-md"
          >
            {property.property_type.toUpperCase()}
          </Badge>
        </div>


        {/* Furnishing Tag */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-[#06080D]/80 backdrop-blur-md text-[#929BAA] border border-[#1E283A]">
            {property.furnishing_status}
          </span>
        </div>

        {/* Bottom Location Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-[#F5F7FA] font-medium drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-[#00F59B] shrink-0" />
            <span className="truncate">{property.neighborhood}, {property.city}</span>
          </span>
        </div>
      </div>

      {/* Property Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#F5F7FA] group-hover:text-[#00F59B] transition-colors line-clamp-1">
            {property.title}
          </h3>

          {property.description && (
            <p className="text-xs text-[#929BAA] line-clamp-2 mt-1.5 leading-relaxed">
              {property.description}
            </p>
          )}

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1E283A]/70 text-xs text-[#929BAA]">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{property.total_bedrooms} BHK Flat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FFD600]" />
              <span className="truncate">{property.preferred_gender}</span>
            </div>
          </div>

          {/* Amenities Chips (Top 3) */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {property.amenities.slice(0, 3).map((amenity, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#161F2E] text-[#929BAA] border border-[#1E283A]"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#161F2E] text-[#5F697A]">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-[#1E283A] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-[#00F59B] font-mono">
                ₹{property.monthly_rent.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#929BAA] font-mono">/month</span>
            </div>
            <div className="text-[10px] text-[#5F697A] font-mono">
              Deposit: ₹{property.deposit_amount.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(property)}
              className="text-xs px-3 py-1.5"
            >
              Specs
            </Button>
            {isAvailable && onApply && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApply(property)}
                className="text-xs px-3.5 py-1.5 flex items-center gap-1"
              >
                <span>Apply</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
