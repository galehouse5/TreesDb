// Import-wizard photo gallery -- task P3-08 (doc 05 §P3-08). Port of
// legacy's `EditorTemplates/PhotoGalleryModel.cshtml` (a thumbnail list with
// a Remove link per photo and an "Add photo" button) for an import site or
// tree, plus a caption field per photo. Rendered OUTSIDE the site/tree form
// (forms can't nest); every control posts to app/import/photo-actions.ts.
import { Input } from "@/components/ui/input";
import { ConfirmSubmitButton } from "@/components/import/confirm-submit-button";
import { SubmitButton } from "@/components/import/submit-button";
import {
  addImportPhotoAction,
  removeImportPhotoAction,
  saveImportPhotoCaptionAction,
} from "@/app/import/photo-actions";
import { MAX_CAPTION_LENGTH, type ImportPhoto } from "@/db/queries/import-photos.sql";
import { MAX_UPLOAD_BYTES } from "@/lib/photos/upload";

interface PhotoGalleryProps {
  tripId: number;
  ownerKind: "site" | "tree";
  ownerId: number;
  photos: ImportPhoto[];
  /** The step page (with its query) the actions return to. */
  returnTo: string;
  error?: string;
}

function HiddenContext({ tripId, ownerKind, ownerId, returnTo }: Omit<PhotoGalleryProps, "photos" | "error">) {
  return (
    <>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="ownerKind" value={ownerKind} />
      <input type="hidden" name="ownerId" value={ownerId} />
      <input type="hidden" name="returnTo" value={returnTo} />
    </>
  );
}

export function PhotoGallery(props: PhotoGalleryProps) {
  const { photos, error, ownerKind, ownerId } = props;
  const inputId = `photo-${ownerKind}-${ownerId}`;
  return (
    <section className="space-y-3 border-t pt-4" aria-label="Photos">
      <h4 className="text-sm font-medium">Photos</h4>
      {photos.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {photos.map((photo) => (
            <li key={photo.referenceId} className="flex gap-3 rounded-md border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- served by /photos, which does its own resizing */}
              <img
                src={`/photos/${photo.photoId}/SquareThumbnail`}
                alt={photo.caption ?? "Photo"}
                width={100}
                height={100}
                className="size-[100px] shrink-0 rounded object-cover ring-1 ring-border"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <form action={saveImportPhotoCaptionAction} className="flex gap-2">
                  <HiddenContext {...props} />
                  <input type="hidden" name="referenceId" value={photo.referenceId} />
                  <Input
                    name="caption"
                    defaultValue={photo.caption ?? ""}
                    maxLength={MAX_CAPTION_LENGTH}
                    placeholder="Caption (optional)"
                    aria-label="Caption"
                    className="h-8"
                  />
                  <SubmitButton variant="outline" size="sm">
                    Save
                  </SubmitButton>
                </form>
                <form action={removeImportPhotoAction}>
                  <HiddenContext {...props} />
                  <input type="hidden" name="referenceId" value={photo.referenceId} />
                  <ConfirmSubmitButton variant="destructive" size="sm" message="Remove this photo?">
                    Remove
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <form action={addImportPhotoAction} className="flex flex-wrap items-center gap-2">
        <HiddenContext {...props} />
        <label htmlFor={inputId} className="sr-only">
          Photo file
        </label>
        <input
          id={inputId}
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          required
          className="max-w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1 file:text-sm"
        />
        <SubmitButton variant="outline" size="sm">
          Add photo
        </SubmitButton>
        <p className="w-full text-xs text-muted-foreground">
          JPEG, PNG or GIF, up to {MAX_UPLOAD_BYTES / (1024 * 1024)} MB.
        </p>
      </form>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
