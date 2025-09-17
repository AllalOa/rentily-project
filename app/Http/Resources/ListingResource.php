<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'price_per_day' => $this->price_per_day,
            'location' => $this->location,
            'status' => $this->status,
            'host' => new UserResource($this->whenLoaded('host')),
            'images' => ListingImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at,
        ];
    }
}


