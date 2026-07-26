// Tree edit form + trunk sub-forms -- task P3-05 (doc 05 §P3-05). Renders
// the fuller domain-model field set (see lib/import-trees.ts's header for
// why this goes beyond the trimmed legacy `ImportTreeModel`/
// `ImportTreeModel.cshtml`): CommonName/ScientificName, Status/AgeClass/
// AgeType/Age, Height(+method)/Girth/CrownSpread/Elevation, Terrain type,
// Coordinates, General comments, plus a tree-type toggle and (multi-trunk
// only) Form type, Combined girth number of trunks, and a trunk sub-form
// list with add/remove.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoordinatePicker } from "@/components/import/coordinate-picker";
import { NATIVE_SELECT_CLASS_NAME } from "@/components/import/wizard-ui";
import { cn } from "@/lib/utils";
import type { TreeRecord, TrunkRecord } from "@/db/queries/import-trees.sql";
import {
  AGE_CLASS_OPTIONS,
  AGE_TYPE_OPTIONS,
  HEIGHT_MEASUREMENT_METHOD_OPTIONS,
  ImportTreeType,
  MULTI_TRUNK_FORM_OPTIONS,
  STATUS_OPTIONS,
  TERRAIN_OPTIONS,
  coordinatesToEditableText,
  distanceToEditableText,
  elevationToEditableText,
  type TreeFieldError,
  type TreeStepInput,
  type TrunkFieldError,
  type TrunkInput,
} from "@/lib/import-trees";
import type { TreeRedisplayState } from "./actions";
import { addTrunkAction, removeTrunkAction, saveTreeAction } from "./actions";

// Code-audit finding: this used to be a local literal duplicating
// `app/import/[tripId]/sites/page.tsx`'s state-select class string --
// hoisted to the shared `NATIVE_SELECT_CLASS_NAME` constant
// (components/import/wizard-ui.tsx) instead.
const selectClassName = NATIVE_SELECT_CLASS_NAME;

function fieldError(errors: TreeFieldError[] | undefined, field: TreeFieldError["field"]): string | undefined {
  return errors?.find((e) => e.field === field)?.message;
}

function trunkFieldError(
  errors: TrunkFieldError[] | undefined,
  field: TrunkFieldError["field"],
): string | undefined {
  return errors?.find((e) => e.field === field)?.message;
}

function ErrorText({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

function defaultInputFor(tree: TreeRecord): TreeStepInput {
  return {
    treeType: tree.type,
    commonName: tree.commonName,
    scientificName: tree.scientificName,
    status: tree.status,
    ageClass: tree.ageClass,
    ageType: tree.ageType,
    age: tree.age === null ? "" : String(tree.age),
    height: distanceToEditableText(tree.height, tree.heightInputFormat),
    heightMeasurementMethod: tree.heightMeasurementMethod,
    girth: distanceToEditableText(tree.girth, tree.girthInputFormat),
    combinedGirthNumberOfTrunks: tree.combinedGirthNumberOfTrunks === null ? "" : String(tree.combinedGirthNumberOfTrunks),
    crownSpread: distanceToEditableText(tree.crownSpread, tree.crownSpreadInputFormat),
    elevation: elevationToEditableText(tree.elevation, tree.elevationInputFormat),
    terrainType: tree.terrainType,
    formType: tree.formType,
    coordinates: coordinatesToEditableText(
      tree.latitude,
      tree.latitudeInputFormat,
      tree.longitude,
      tree.longitudeInputFormat,
    ),
    generalComments: tree.generalComments,
  };
}

function defaultTrunkInputFor(trunk: TrunkRecord): TrunkInput {
  return {
    girth: distanceToEditableText(trunk.girth, trunk.girthInputFormat),
    girthMeasurementHeight: distanceToEditableText(trunk.girthMeasurementHeight, trunk.girthMeasurementHeightInputFormat),
    height: distanceToEditableText(trunk.height, trunk.heightInputFormat),
    trunkComments: trunk.trunkComments,
  };
}

interface TreeFormProps {
  tripId: number;
  tree: TreeRecord;
  trunks: TrunkRecord[];
  redisplay: TreeRedisplayState | null;
}

export function TreeForm({ tripId, tree, trunks, redisplay }: TreeFormProps) {
  const isRedisplayForThisTree = redisplay !== null;
  const input = isRedisplayForThisTree ? redisplay!.input : defaultInputFor(tree);
  const requiredErrors = redisplay?.requiredErrors ?? [];
  const optionalErrors = redisplay?.optionalErrors ?? [];
  const trunkErrorsById = redisplay?.trunkErrors ?? {};
  const isMulti = input.treeType === ImportTreeType.MultiTrunk;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <form action={saveTreeAction} className="space-y-4">
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="treeId" value={tree.id} />
        <input type="hidden" name="trunkIds" value={trunks.map((t) => t.id).join(",")} />

        <div className="space-y-1">
          <span className="text-sm font-medium">Tree type</span>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="treeType"
                value={ImportTreeType.SingleTrunk}
                defaultChecked={!isMulti}
                className="accent-primary"
              />
              Single trunk
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="treeType"
                value={ImportTreeType.MultiTrunk}
                defaultChecked={isMulti}
                className="accent-primary"
              />
              Multi trunk
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor={`commonName-${tree.id}`} className="text-sm font-medium">
              Common name
            </label>
            <Input
              id={`commonName-${tree.id}`}
              name="commonName"
              defaultValue={input.commonName}
              aria-invalid={!!fieldError(requiredErrors, "commonName")}
            />
            <ErrorText message={fieldError(requiredErrors, "commonName")} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`scientificName-${tree.id}`} className="text-sm font-medium">
              Scientific name
            </label>
            <Input id={`scientificName-${tree.id}`} name="scientificName" defaultValue={input.scientificName} />
            <ErrorText message={fieldError(requiredErrors, "scientificName")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor={`status-${tree.id}`} className="text-sm font-medium">
              Status
            </label>
            <select id={`status-${tree.id}`} name="status" defaultValue={input.status} className={selectClassName}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`ageClass-${tree.id}`} className="text-sm font-medium">
              Age class
            </label>
            <select id={`ageClass-${tree.id}`} name="ageClass" defaultValue={input.ageClass} className={selectClassName}>
              {AGE_CLASS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`ageType-${tree.id}`} className="text-sm font-medium">
              Age type
            </label>
            <select id={`ageType-${tree.id}`} name="ageType" defaultValue={input.ageType} className={selectClassName}>
              {AGE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor={`age-${tree.id}`} className="text-sm font-medium">
            Age (years)
          </label>
          <Input id={`age-${tree.id}`} name="age" defaultValue={input.age} aria-invalid={!!fieldError(requiredErrors, "age")} />
          <ErrorText message={fieldError(requiredErrors, "age")} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor={`height-${tree.id}`} className="text-sm font-medium">
              Height <span className="text-muted-foreground">(e.g. 100&apos;, 12&apos; 6&apos;&apos;, 30.48 m)</span>
            </label>
            <Input id={`height-${tree.id}`} name="height" defaultValue={input.height} aria-invalid={!!fieldError(requiredErrors, "height")} />
            <ErrorText message={fieldError(requiredErrors, "height")} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`heightMeasurementMethod-${tree.id}`} className="text-sm font-medium">
              Height measurement method
            </label>
            <select
              id={`heightMeasurementMethod-${tree.id}`}
              name="heightMeasurementMethod"
              defaultValue={input.heightMeasurementMethod}
              className={selectClassName}
            >
              {HEIGHT_MEASUREMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor={`girth-${tree.id}`} className="text-sm font-medium">
              {isMulti ? "Combined girth" : "Girth"}{" "}
              <span className="text-muted-foreground">(e.g. 8&apos; 6&apos;&apos;, 2.59 m)</span>
            </label>
            <Input id={`girth-${tree.id}`} name="girth" defaultValue={input.girth} aria-invalid={!!fieldError(requiredErrors, "girth")} />
            <ErrorText message={fieldError(requiredErrors, "girth")} />
          </div>
          {isMulti ? (
            <div className="space-y-1">
              <label htmlFor={`combinedGirthNumberOfTrunks-${tree.id}`} className="text-sm font-medium">
                Number of trunks in combined girth
              </label>
              <Input
                id={`combinedGirthNumberOfTrunks-${tree.id}`}
                name="combinedGirthNumberOfTrunks"
                defaultValue={input.combinedGirthNumberOfTrunks}
                aria-invalid={!!fieldError(requiredErrors, "combinedGirthNumberOfTrunks")}
              />
              <ErrorText message={fieldError(requiredErrors, "combinedGirthNumberOfTrunks")} />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor={`crownSpread-${tree.id}`} className="text-sm font-medium">
              Crown spread
            </label>
            <Input id={`crownSpread-${tree.id}`} name="crownSpread" defaultValue={input.crownSpread} aria-invalid={!!fieldError(requiredErrors, "crownSpread")} />
            <ErrorText message={fieldError(requiredErrors, "crownSpread")} />
          </div>
          <div className="space-y-1">
            <label htmlFor={`elevation-${tree.id}`} className="text-sm font-medium">
              Elevation
            </label>
            <Input id={`elevation-${tree.id}`} name="elevation" defaultValue={input.elevation} aria-invalid={!!fieldError(requiredErrors, "elevation")} />
            <ErrorText message={fieldError(requiredErrors, "elevation")} />
          </div>
        </div>

        {isMulti ? (
          <div className="space-y-1">
            <label htmlFor={`formType-${tree.id}`} className="text-sm font-medium">
              Form type
            </label>
            <select id={`formType-${tree.id}`} name="formType" defaultValue={input.formType} className={selectClassName}>
              {MULTI_TRUNK_FORM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ErrorText message={fieldError(requiredErrors, "formType")} />
          </div>
        ) : null}

        <div className="space-y-1">
          <label htmlFor={`terrainType-${tree.id}`} className="text-sm font-medium">
            Terrain type
          </label>
          <select id={`terrainType-${tree.id}`} name="terrainType" defaultValue={input.terrainType} className={selectClassName}>
            {TERRAIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor={`coordinates-${tree.id}`} className="text-sm font-medium">
            Coordinates <span className="text-muted-foreground">(e.g. 41.49932, -81.69437)</span>
          </label>
          <div className="flex gap-2">
            <Input
              id={`coordinates-${tree.id}`}
              name="coordinates"
              defaultValue={input.coordinates}
              aria-invalid={!!fieldError(requiredErrors, "coordinates")}
            />
            <CoordinatePicker targetInputId={`coordinates-${tree.id}`} />
          </div>
          <ErrorText message={fieldError(requiredErrors, "coordinates")} />
          <ErrorText message={fieldError(optionalErrors, "coordinates")} />
        </div>

        <div className="space-y-1">
          <label htmlFor={`generalComments-${tree.id}`} className="text-sm font-medium">
            Comments
          </label>
          <Textarea
            id={`generalComments-${tree.id}`}
            name="generalComments"
            defaultValue={input.generalComments}
            rows={3}
          />
          <ErrorText message={fieldError(requiredErrors, "generalComments")} />
        </div>

        {isMulti ? (
          <div className="space-y-2 rounded-r-md border-l-4 border-primary/30 bg-muted/30 p-3">
            <h5 className="text-sm font-medium text-primary">Trunks</h5>
            {trunks.length === 0 ? <p className="text-sm text-muted-foreground">No trunks added yet.</p> : null}
            {trunks.map((trunk) => {
              const trunkInput = redisplay?.trunkInputs[trunk.id] ?? defaultTrunkInputFor(trunk);
              const errors = trunkErrorsById[trunk.id];
              return (
                <div
                  key={trunk.id}
                  className="grid grid-cols-1 gap-2 border-t border-border/70 pt-2 first:border-t-0 first:pt-0 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div className="space-y-1">
                    <label htmlFor={`trunk_${trunk.id}_girth`} className="text-xs font-medium">
                      Girth
                    </label>
                    <Input
                      id={`trunk_${trunk.id}_girth`}
                      name={`trunk_${trunk.id}_girth`}
                      defaultValue={trunkInput.girth}
                      aria-invalid={!!trunkFieldError(errors, "girth")}
                    />
                    <ErrorText message={trunkFieldError(errors, "girth")} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`trunk_${trunk.id}_girthMeasurementHeight`} className="text-xs font-medium">
                      Girth height
                    </label>
                    <Input
                      id={`trunk_${trunk.id}_girthMeasurementHeight`}
                      name={`trunk_${trunk.id}_girthMeasurementHeight`}
                      defaultValue={trunkInput.girthMeasurementHeight}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`trunk_${trunk.id}_height`} className="text-xs font-medium">
                      Height
                    </label>
                    <Input
                      id={`trunk_${trunk.id}_height`}
                      name={`trunk_${trunk.id}_height`}
                      defaultValue={trunkInput.height}
                      aria-invalid={!!trunkFieldError(errors, "height")}
                    />
                    <ErrorText message={trunkFieldError(errors, "height")} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`trunk_${trunk.id}_trunkComments`} className="text-xs font-medium">
                      Comments
                    </label>
                    <Input
                      id={`trunk_${trunk.id}_trunkComments`}
                      name={`trunk_${trunk.id}_trunkComments`}
                      defaultValue={trunkInput.trunkComments}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* `Model.HasOptionalErrors ? "Save, ignoring optional errors" : "Save"`
            (TreePartial.cshtml:49-51) -- one button whose label AND submitted
            `intent` both switch once an Optional-tag warning is present, not
            two separate buttons. */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            name="intent"
            value={optionalErrors.length > 0 ? "saveIgnoringOptional" : "save"}
            className={cn(optionalErrors.length > 0 && "bg-amber-600 text-white hover:bg-amber-600/90")}
          >
            {optionalErrors.length > 0 ? "Save, ignoring optional errors" : "Save"}
          </Button>
        </div>
      </form>

      {isMulti ? (
        <form action={addTrunkAction} className="mt-2 inline-block">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="treeId" value={tree.id} />
          <Button type="submit" variant="secondary" size="sm">
            Add trunk
          </Button>
        </form>
      ) : null}
      {isMulti && trunks.length > 0
        ? trunks.map((trunk) => (
            <form key={trunk.id} action={removeTrunkAction} className="mt-1 ml-1 inline-block">
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="treeId" value={tree.id} />
              <input type="hidden" name="trunkId" value={trunk.id} />
              <Button type="submit" variant="destructive" size="sm">
                Remove trunk #{trunk.id}
              </Button>
            </form>
          ))
        : null}
    </div>
  );
}
