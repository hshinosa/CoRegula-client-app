<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatUploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,txt'],
        ]);

        $file = $request->file('file');
        $id = (string) Str::uuid();
        $extension = $file->getClientOriginalExtension();
        $storedName = "{$id}.{$extension}";
        $path = $file->storeAs('chat-attachments', $storedName, 'public');

        return response()->json([
            'id' => $id,
            'name' => $file->getClientOriginalName(),
            'type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'url' => Storage::url($path),
            'previewUrl' => str_starts_with($file->getMimeType(), 'image/') ? Storage::url($path) : null,
        ]);
    }
}
