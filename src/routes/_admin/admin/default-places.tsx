import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Plus } from "lucide-react";
import {
  getDefaultPlaces,
  searchPlaces,
  setPlaceDefault,
  removePlaceDefault,
} from "@/server/admin";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchPlace = {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  _count: { subscribers: number };
};

type DefaultPlace = {
  id: string;
  name: string;
  slug: string;
  _count: { subscribers: number };
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_admin/admin/default-places")({
  component: DefaultPlacesPage,
});

function DefaultPlacesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch current default places
  const { data: defaultPlaces, isLoading: loadingDefaults } = useQuery<
    DefaultPlace[]
  >({
    queryKey: ["defaultPlaces"],
    queryFn: () => getDefaultPlaces(),
  });

  // Search places
  const { data: searchResults, isLoading: searching } = useQuery<SearchPlace[]>(
    {
      queryKey: ["searchPlaces", debouncedQuery],
      queryFn: () =>
        searchPlaces({ data: { query: debouncedQuery, limit: 10 } }),
      enabled: debouncedQuery.length >= 1,
    }
  );

  // Add to defaults mutation
  const addMutation = useMutation({
    mutationFn: (placeId: string) => setPlaceDefault({ data: { placeId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultPlaces"] });
      queryClient.invalidateQueries({ queryKey: ["searchPlaces"] });
    },
  });

  // Remove from defaults mutation
  const removeMutation = useMutation({
    mutationFn: (placeId: string) => removePlaceDefault({ data: { placeId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultPlaces"] });
      queryClient.invalidateQueries({ queryKey: ["searchPlaces"] });
    },
  });

  const results = searchResults ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Default Places</h1>
        <p className="text-muted-foreground">
          Manage which places new users are automatically subscribed to
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Default Place</CardTitle>
          <CardDescription>
            Search for places to add to the default list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start text-muted-foreground"
              >
                <Search className="size-4 mr-2" />
                Search places to add...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search places..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {searching
                      ? "Searching..."
                      : debouncedQuery
                        ? "No places found."
                        : "Type to search for places."}
                  </CommandEmpty>
                  {results.length > 0 && (
                    <CommandGroup>
                      {results.map((place) => (
                        <CommandItem
                          key={place.id}
                          value={place.id}
                          onSelect={() => {
                            if (!place.isDefault) {
                              addMutation.mutate(place.id);
                              setSearchQuery("");
                              setOpen(false);
                            }
                          }}
                          disabled={place.isDefault || addMutation.isPending}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{place.name}</p>
                            <p className="text-sm text-muted-foreground">
                              p/{place.slug} - {place._count.subscribers}{" "}
                              subscribers
                            </p>
                          </div>
                          {place.isDefault ? (
                            <span className="text-xs text-muted-foreground">
                              Already a default
                            </span>
                          ) : (
                            <Plus className="size-4 ml-2" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Current Default Places */}
      <Card>
        <CardHeader>
          <CardTitle>Current Default Places</CardTitle>
          <CardDescription>
            {defaultPlaces?.length ?? 0} places - New users will be subscribed
            to these
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDefaults ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : defaultPlaces?.length === 0 ? (
            <p className="text-muted-foreground">
              No default places configured. Use the search above to add some.
            </p>
          ) : (
            <div className="border rounded-md divide-y">
              {defaultPlaces?.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <p className="font-medium">{place.name}</p>
                    <p className="text-sm text-muted-foreground">
                      p/{place.slug} - {place._count.subscribers} subscribers
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeMutation.mutate(place.id)}
                    disabled={removeMutation.isPending}
                  >
                    <X className="size-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
