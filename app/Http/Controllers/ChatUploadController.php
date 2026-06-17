<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

// H3 file-upload hardening decision:
// Chat attachments remain on the 'public' disk because chat messages (including
// inline image previews) are served via Storage::url() directly to the browser.
// Moving them to 'private' would break embedded previews for all existing messages
// and require a streaming proxy for every image — disproportionate cost for
// ephemeral chat attachments that are already behind auth.jwt + assert.chat.membership
// middleware at the route level.
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
