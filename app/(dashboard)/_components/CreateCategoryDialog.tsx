'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
} from '@/schema/categories';
import { zodResolver } from '@hookform/resolvers/zod';

import { CircleOff, Loader2, PlusSquareIcon } from 'lucide-react';

import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_acitons/categories';
import { Category } from '@prisma/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

type Props = {
  type: TransactionType;
  onSuccessCallback: (category: Category) => void;
};

const CreateCategoryDialog = ({ type, onSuccessCallback }: Props) => {
  //this is mainly for theme of emoji picker
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type,
    },
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        type,
        name: '',
        icon: '',
      });

      toast.success(`Category ${data.name} created successfully👌`, {
        id: 'create-category',
      });

      onSuccessCallback(data);

      // Invalidate the categories query to refetch the data
      await queryClient.invalidateQueries({ queryKey: ['categories'] });

      setOpen((prev) => !prev);
    },

    onError: (error) => {
      toast.error('Something went wrong', {
        id: 'create-category',
      });
    },
  });

  const onSubmit = useCallback(
    (data: CreateCategorySchemaType) => {
      toast.loading('Creating category...', { id: 'create-category' });
      mutate(data);
    },
    [mutate]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={'ghost'}
          className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
        >
          <PlusSquareIcon className='mr-2 w-4 h-4' />
          Create new category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create
            <span
              className={cn(
                'm-1',
                type === 'income' ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {type}
            </span>
            category
          </DialogTitle>
          <DialogDescription>
            Category are used to group your transactions. You can create a new
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className=' space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Category' {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose name of{' '}
                    <span
                      className={cn(
                        'm-1',
                        type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                      )}
                    >
                      {type}
                    </span>{' '}
                    category (required)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='icon'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' className='h-[100px] w-full'>
                          {form.watch('icon') ? (
                            <div className='flex flex-col items-center gap-2'>
                              <span className=' text-5xl' role='="img'>
                                {field.value}
                              </span>
                              <p className='text-xs text-muted-foreground'>
                                Click to change
                              </p>{' '}
                            </div>
                          ) : (
                            <div className='flex flex-col items-center gap-2'>
                              <CircleOff className='h-[48px] w-[48px]' />
                              <p className='text-xs text-muted-foreground'>
                                Click to select
                              </p>{' '}
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full'>
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) => {
                            field.onChange(emoji.native);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    This is how your category will appear in the app
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant='secondary'
              type='button'
              onClick={() => {
                form.reset();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
            className='mb-2'
          >
            {isPending ? <Loader2 className=' animate-spin' /> : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;