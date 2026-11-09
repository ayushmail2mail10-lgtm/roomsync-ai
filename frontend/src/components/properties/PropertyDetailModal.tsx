import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  IndianRupee, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  Calendar,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import { PropertyListing, RoomListing } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing | null;
  onApplyForProperty: (property: PropertyListing, room?: RoomListing) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  onApplyForProperty
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!property) return null;

  const defaultImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";
  const images = property.image_urls && property.image_urls.length > 0 ? property.image_urls : [defaultImage];
  const isAvailable = property.available_bedrooms > 0 && property.status === 'active';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property.title}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        
        {/* Gallery Section */}
        <div className="space-y-2">
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-[#0A0E17] border border-[#1E283A]">
            <img
              src={images[selectedImageIndex] || defaultImage}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant={isAvailable ? 'green' : 'neutral'}>
                {isAvailable ? `${property.available_bedrooms} / ${property.total_bedrooms} ROOMS AVAILABLE` : 'FULLY OCCUPIED'}
              </Badge>
              <Badge variant="cyan">{property.property_type}</Badge>
            </div>
          </div>


          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-[#00F59B] scale-105' : 'border-[#1E283A] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E283A]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#00F59B] font-mono mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{property.neighborhood}, {property.city}</span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F7FA]">{property.title}</h2>
            {property.address && (
              <p className="text-xs text-[#929BAA] font-mono mt-0.5">{property.address}</p>
            )}
          </div>

          {/* Rent Box */}
          <div className="p-3 rounded-2xl bg-[#161F2E] border border-[#1E283A] text-right shrink-0">
            <div className="text-2xl font-black text-[#00F59B] font-mono">
              ₹{property.monthly_rent.toLocaleString('en-IN')}
              <span className="text-xs text-[#929BAA] font-normal"> /mo</span>
            </div>
            <div className="text-[11px] text-[#929BAA] font-mono">
              Security Deposit: ₹{property.deposit_amount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Owner Trust Profile */}
        {property.owner && (
          <div className="p-4 rounded-2xl bg-[#0A0E17] border border-[#1E283A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={property.owner.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={property.owner.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#1E283A]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#F5F7FA]">{property.owner.name}</span>
                  {property.owner.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 text-[10px] font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Owner
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#929BAA] font-mono">{property.owner.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center sm:text-right">
                <div className="text-[10px] text-[#929BAA] uppercase tracking-wider">Trust Score</div>
                <div className="text-base font-bold text-[#00F0FF]">{property.owner.trust_score} / 100</div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono uppercase text-[#929BAA] tracking-wider">Property Overview</h4>
            <p className="text-sm text-[#F5F7FA] leading-relaxed bg-[#111722] p-4 rounded-2xl border border-[#1E283A]">
              {property.description}
            </p>
          </div>
        )}

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#161F2E] border border-[#1E283A]">
            <div className="text-[10px] text-[#929BAA] font-mono uppercase">Furnishing</div>
            <div className="text-xs font-semibold text-[#F5F7FA] mt-0.5">{property.furnishing_status}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#161F2E] border border-[#1E283A]">
            <div className="text-[10px] text-[#929BAA] font-mono uppercase">Gender Fit</div>
            <div className="text-xs font-semibold text-[#F5F7FA] mt-0.5">{property.preferred_gender}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#161F2E] border border-[#1E283A]">
            <div className="text-[10px] text-[#929BAA] font-mono uppercase">Food Preference</div>
            <div className="text-xs font-semibold text-[#F5F7FA] mt-0.5">{property.food_preference}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#161F2E] border border-[#1E283A]">
            <div className="text-[10px] text-[#929BAA] font-mono uppercase">Status</div>
            <div className="text-xs font-semibold text-[#00F59B] mt-0.5 capitalize">{property.status}</div>
          </div>
        </div>

        {/* Individual Rooms Breakdown */}
        {property.rooms && property.rooms.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase text-[#929BAA] tracking-wider flex items-center justify-between">
              <span>Rooms in this Property</span>
              <span className="text-[10px] text-[#00F0FF]">{property.rooms.length} Configured</span>
            </h4>

            <div className="space-y-2">
              {property.rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    room.is_vacant 
                      ? 'bg-[#111722] border-[#1E283A] hover:border-[#00F59B]/40' 
                      : 'bg-[#0A0E17] border-[#1E283A]/50 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F5F7FA]">{room.title}</span>
                      <Badge variant={room.is_vacant ? 'green' : 'neutral'} className="text-[9px]">
                        {room.is_vacant ? 'Vacant' : 'Occupied'}
                      </Badge>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161F2E] text-[#929BAA]">
                        {room.room_type}
                      </span>
                    </div>
                    {room.furnishing && (
                      <div className="text-xs text-[#929BAA]">{room.furnishing}</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#00F59B] font-mono">
                        ₹{room.rent.toLocaleString('en-IN')}<span className="text-[10px] text-[#929BAA]">/mo</span>
                      </div>
                      <div className="text-[10px] text-[#5F697A] font-mono">
                        Dep: ₹{room.deposit.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {room.is_vacant && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          onClose();
                          onApplyForProperty(property, room);
                        }}
                        className="text-xs px-3 py-1.5"
                      >
                        Apply Room
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amenities Grid */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase text-[#929BAA] tracking-wider">Amenities Included</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#F5F7FA] bg-[#161F2E] p-2.5 rounded-xl border border-[#1E283A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F59B] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* House Rules */}
        {property.rules && property.rules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase text-[#929BAA] tracking-wider">House Rules & Expectations</h4>
            <div className="space-y-1.5">
              {property.rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#929BAA] bg-[#0A0E17] p-2.5 rounded-xl border border-[#1E283A]">
                  <Info className="w-3.5 h-3.5 text-[#FFD600] shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1E283A] flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Close
          </Button>

          {isAvailable ? (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onApplyForProperty(property);
              }}
              className="text-xs px-6 py-2.5 shadow-neon-green"
            >
              Apply for this Property / Room
            </Button>
          ) : (
            <span className="text-xs font-mono text-[#929BAA]">
              Currently fully occupied
            </span>
          )}
        </div>

      </div>
    </Modal>
  );
};
